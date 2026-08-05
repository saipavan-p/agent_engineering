import unittest
from unittest.mock import MagicMock, call

from order_service import (
    Order,
    InventoryService,
    PaymentGateway,
    InventoryShortageError,
    PaymentFailedError,
    InvalidOrderError
)


class TestOrderService(unittest.TestCase):
    def setUp(self):
        # Create mock instances for external services
        self.mock_inventory = MagicMock(spec=InventoryService)
        self.mock_payment = MagicMock(spec=PaymentGateway)
        
        # Instantiate Order with mock dependencies
        self.email = "customer@example.com"
        self.order = Order(
            inventory_service=self.mock_inventory,
            payment_gateway=self.mock_payment,
            customer_email=self.email,
            is_vip=False
        )

    # --- Cart Operations Tests ---
    def test_add_item_success(self):
        self.order.add_item("prod_1", price=25.0, quantity=2)
        self.assertIn("prod_1", self.order.items)
        self.assertEqual(self.order.items["prod_1"], {"price": 25.0, "qty": 2})

    def test_add_existing_item_accumulates_quantity(self):
        self.order.add_item("prod_1", price=25.0, quantity=2)
        self.order.add_item("prod_1", price=25.0, quantity=3)
        self.assertEqual(self.order.items["prod_1"]["qty"], 5)

    def test_add_item_negative_price_raises_value_error(self):
        with self.assertRaises(ValueError) as ctx:
            self.order.add_item("prod_1", price=-10.0, quantity=1)
        self.assertEqual(str(ctx.exception), "Price cannot be negative")

    def test_add_item_zero_or_negative_quantity_raises_value_error(self):
        with self.assertRaises(ValueError) as ctx:
            self.order.add_item("prod_1", price=10.0, quantity=0)
        self.assertEqual(str(ctx.exception), "Quantity must be greater than zero")

        with self.assertRaises(ValueError) as ctx:
            self.order.add_item("prod_1", price=10.0, quantity=-2)
        self.assertEqual(str(ctx.exception), "Quantity must be greater than zero")

    def test_remove_item_success(self):
        self.order.add_item("prod_1", price=15.0, quantity=1)
        self.order.add_item("prod_2", price=30.0, quantity=1)
        self.order.remove_item("prod_1")
        
        self.assertNotIn("prod_1", self.order.items)
        self.assertIn("prod_2", self.order.items)

    def test_remove_nonexistent_item_does_not_raise(self):
        self.order.add_item("prod_1", price=15.0, quantity=1)
        self.order.remove_item("nonexistent_prod")
        self.assertIn("prod_1", self.order.items)

    # --- Pricing & Discount Tests ---
    def test_total_price_calculation(self):
        self.order.add_item("prod_1", price=10.0, quantity=2) # 20.0
        self.order.add_item("prod_2", price=50.0, quantity=1) # 50.0
        self.assertEqual(self.order.total_price, 70.0)

    def test_discount_non_vip_under_100(self):
        self.order.add_item("prod_1", price=50.0, quantity=1)
        self.assertEqual(self.order.apply_discount(), 50.0)

    def test_discount_non_vip_over_100(self):
        self.order.add_item("prod_1", price=150.0, quantity=1)
        # 10% off on 150.0 = 135.0
        self.assertEqual(self.order.apply_discount(), 135.0)

    def test_discount_vip(self):
        vip_order = Order(
            inventory_service=self.mock_inventory,
            payment_gateway=self.mock_payment,
            customer_email="vip@example.com",
            is_vip=True
        )
        vip_order.add_item("prod_1", price=50.0, quantity=1)
        # 20% off on 50.0 = 40.0
        self.assertEqual(vip_order.apply_discount(), 40.0)

    # --- Checkout Flow Tests ---
    def test_checkout_empty_cart_raises_invalid_order_error(self):
        with self.assertRaises(InvalidOrderError) as ctx:
            self.order.checkout()
        self.assertEqual(str(ctx.exception), "Cannot checkout an empty cart")
        self.mock_payment.charge.assert_not_called()
        self.mock_inventory.decrement_stock.assert_not_called()

    def test_checkout_inventory_shortage_raises_error(self):
        self.order.add_item("prod_1", price=50.0, quantity=5)
        # Inventory only has 2 in stock
        self.mock_inventory.get_stock.return_value = 2

        with self.assertRaises(InventoryShortageError) as ctx:
            self.order.checkout()

        self.assertIn("Not enough stock for prod_1", str(ctx.exception))
        self.mock_inventory.get_stock.assert_called_once_with("prod_1")
        # Ensure payment was not attempted and stock was not decremented
        self.mock_payment.charge.assert_not_called()
        self.mock_inventory.decrement_stock.assert_not_called()

    def test_checkout_payment_declined_raises_error(self):
        self.order.add_item("prod_1", price=150.0, quantity=1)
        self.mock_inventory.get_stock.return_value = 10
        # Payment gateway declines
        self.mock_payment.charge.return_value = False

        with self.assertRaises(PaymentFailedError) as ctx:
            self.order.checkout()

        self.assertEqual(str(ctx.exception), "Payment gateway error: Transaction declined by gateway")
        # Final price = 135.0 (10% off 150)
        self.mock_payment.charge.assert_called_once_with(135.0, "USD")
        # Stock should NOT be decremented if payment fails
        self.mock_inventory.decrement_stock.assert_not_called()
        self.assertFalse(self.order.is_paid)
        self.assertEqual(self.order.status, "DRAFT")

    def test_checkout_payment_exception_raises_error(self):
        self.order.add_item("prod_1", price=50.0, quantity=1)
        self.mock_inventory.get_stock.return_value = 10
        # Payment gateway throws network exception
        self.mock_payment.charge.side_effect = Exception("Gateway Timeout")

        with self.assertRaises(PaymentFailedError) as ctx:
            self.order.checkout()

        self.assertIn("Payment gateway error: Gateway Timeout", str(ctx.exception))
        self.mock_inventory.decrement_stock.assert_not_called()

    def test_checkout_success(self):
        self.order.add_item("prod_1", price=40.0, quantity=2) # 80.0
        self.order.add_item("prod_2", price=60.0, quantity=1) # 60.0
        # Total = 140.0 -> 10% discount = 126.0

        # Stock mock return mapping
        self.mock_inventory.get_stock.side_effect = lambda prod_id: 10
        self.mock_payment.charge.return_value = True

        result = self.order.checkout()

        # Check return value
        self.assertEqual(result, {"status": "success", "charged_amount": 126.0})

        # Verify stock checks
        self.mock_inventory.get_stock.assert_has_calls([
            call("prod_1"),
            call("prod_2")
        ], any_order=True)

        # Verify payment charge
        self.mock_payment.charge.assert_called_once_with(126.0, "USD")

        # Verify stock decrement
        self.mock_inventory.decrement_stock.assert_has_calls([
            call("prod_1", 2),
            call("prod_2", 1)
        ], any_order=True)

        # Verify order state updates
        self.assertTrue(self.order.is_paid)
        self.assertEqual(self.order.status, "COMPLETED")


if __name__ == "__main__":
    unittest.main()
