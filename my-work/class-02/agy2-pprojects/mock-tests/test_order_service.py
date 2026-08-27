import unittest
from unittest.mock import Mock, call
from order_service import (
    Order,
    InventoryService,
    PaymentGateway,
    InventoryShortageError,
    PaymentFailedError,
    InvalidOrderError,
)


class TestOrderService(unittest.TestCase):
    def setUp(self):
        """Set up fresh mock objects and standard order before each test."""
        self.mock_inventory = Mock(spec=InventoryService)
        self.mock_payment = Mock(spec=PaymentGateway)
        self.customer_email = "customer@example.com"
        self.order = Order(
            inventory_service=self.mock_inventory,
            payment_gateway=self.mock_payment,
            customer_email=self.customer_email,
            is_vip=False,
        )

    # ----------------------------------------------------
    # 1. Cart Management Tests
    # ----------------------------------------------------
    def test_add_item_success(self):
        """Test adding items with valid price and quantity."""
        self.order.add_item("prod_1", price=25.0, quantity=2)
        self.assertIn("prod_1", self.order.items)
        self.assertEqual(self.order.items["prod_1"], {"price": 25.0, "qty": 2})

    def test_add_existing_item_increments_quantity(self):
        """Test adding an existing item increases its quantity."""
        self.order.add_item("prod_1", price=25.0, quantity=2)
        self.order.add_item("prod_1", price=25.0, quantity=3)
        self.assertEqual(self.order.items["prod_1"]["qty"], 5)

    def test_add_item_negative_price_raises_value_error(self):
        """Test adding an item with negative price raises ValueError."""
        with self.assertRaises(ValueError) as ctx:
            self.order.add_item("prod_invalid", price=-10.0, quantity=1)
        self.assertEqual(str(ctx.exception), "Price cannot be negative")

    def test_add_item_zero_or_negative_quantity_raises_value_error(self):
        """Test adding an item with zero or negative quantity raises ValueError."""
        with self.assertRaises(ValueError) as ctx:
            self.order.add_item("prod_invalid", price=10.0, quantity=0)
        self.assertEqual(str(ctx.exception), "Quantity must be greater than zero")

        with self.assertRaises(ValueError) as ctx:
            self.order.add_item("prod_invalid", price=10.0, quantity=-2)
        self.assertEqual(str(ctx.exception), "Quantity must be greater than zero")

    def test_remove_item(self):
        """Test removing an item from the cart."""
        self.order.add_item("prod_1", price=20.0, quantity=1)
        self.order.remove_item("prod_1")
        self.assertNotIn("prod_1", self.order.items)

    def test_remove_non_existent_item_does_not_raise(self):
        """Test removing a non-existent item is handled gracefully."""
        self.order.remove_item("non_existent")  # Should not raise exception

    # ----------------------------------------------------
    # 2. Pricing and Discount Tests
    # ----------------------------------------------------
    def test_total_price_calculation(self):
        """Test total_price computes the sum of price * quantity."""
        self.order.add_item("prod_1", price=15.0, quantity=2)  # 30.0
        self.order.add_item("prod_2", price=20.0, quantity=1)  # 20.0
        self.assertEqual(self.order.total_price, 50.0)

    def test_apply_discount_regular_customer_under_100(self):
        """Regular customer with total <= 100 gets 0% discount."""
        self.order.add_item("prod_1", price=50.0, quantity=2)  # 100.0
        self.assertEqual(self.order.apply_discount(), 100.0)

    def test_apply_discount_regular_customer_over_100(self):
        """Regular customer with total > 100 gets 10% discount."""
        self.order.add_item("prod_1", price=120.0, quantity=1)  # 120.0
        # 120 * 0.9 = 108.0
        self.assertEqual(self.order.apply_discount(), 108.0)

    def test_apply_discount_vip_customer(self):
        """VIP customer gets 20% discount regardless of total amount."""
        vip_order = Order(
            inventory_service=self.mock_inventory,
            payment_gateway=self.mock_payment,
            customer_email="vip@example.com",
            is_vip=True,
        )
        vip_order.add_item("prod_1", price=50.0, quantity=1)  # 50.0
        # 50 * 0.8 = 40.0
        self.assertEqual(vip_order.apply_discount(), 40.0)

    # ----------------------------------------------------
    # 3. Checkout Validation & Error Handling (Mocked)
    # ----------------------------------------------------
    def test_checkout_empty_cart_raises_invalid_order_error(self):
        """Checkout on an empty cart raises InvalidOrderError."""
        with self.assertRaises(InvalidOrderError) as ctx:
            self.order.checkout()
        self.assertEqual(str(ctx.exception), "Cannot checkout an empty cart")
        # Ensure no calls were made to external services
        self.mock_inventory.get_stock.assert_not_called()
        self.mock_payment.charge.assert_not_called()

    def test_checkout_inventory_shortage_raises_error(self):
        """Inventory shortage raises InventoryShortageError and stops payment."""
        self.order.add_item("prod_1", price=50.0, quantity=5)
        # Mock inventory service to return insufficient stock
        self.mock_inventory.get_stock.return_value = 2

        with self.assertRaises(InventoryShortageError) as ctx:
            self.order.checkout()

        self.assertIn("Not enough stock for prod_1", str(ctx.exception))
        self.mock_inventory.get_stock.assert_called_once_with("prod_1")
        # Payment must not be attempted if stock check fails
        self.mock_payment.charge.assert_not_called()
        # Stock must not be decremented
        self.mock_inventory.decrement_stock.assert_not_called()

    def test_checkout_payment_declined_raises_payment_failed_error(self):
        """Payment declined raises PaymentFailedError and does not decrement stock."""
        self.order.add_item("prod_1", price=50.0, quantity=1)
        self.mock_inventory.get_stock.return_value = 10
        # Mock payment gateway to decline transaction
        self.mock_payment.charge.return_value = False

        with self.assertRaises(PaymentFailedError) as ctx:
            self.order.checkout()

        self.assertEqual(str(ctx.exception), "Transaction declined by gateway")
        self.mock_payment.charge.assert_called_once_with(50.0, "USD")
        # Stock must NOT be decremented if payment fails
        self.mock_inventory.decrement_stock.assert_not_called()
        self.assertFalse(self.order.is_paid)
        self.assertEqual(self.order.status, "DRAFT")

    def test_checkout_payment_gateway_exception_wrapped(self):
        """Network/Gateway exceptions during charge are wrapped in PaymentFailedError."""
        self.order.add_item("prod_1", price=50.0, quantity=1)
        self.mock_inventory.get_stock.return_value = 10
        # Mock payment gateway throwing a network exception
        self.mock_payment.charge.side_effect = ConnectionError("Gateway timeout")

        with self.assertRaises(PaymentFailedError) as ctx:
            self.order.checkout()

        self.assertIn("Payment gateway error: Gateway timeout", str(ctx.exception))
        self.mock_inventory.decrement_stock.assert_not_called()
        self.assertFalse(self.order.is_paid)
        self.assertEqual(self.order.status, "DRAFT")

    # ----------------------------------------------------
    # 4. Successful Checkout Flow (End-to-End with Mocks)
    # ----------------------------------------------------
    def test_checkout_success_regular_customer(self):
        """Test complete successful checkout flow for a regular customer."""
        self.order.add_item("prod_1", price=60.0, quantity=2)  # Total: 120.0 -> Disounted: 108.0
        self.order.add_item("prod_2", price=10.0, quantity=1)  # Total: 130.0 -> Discounted: 117.0

        # Mock stock returns sufficient quantities
        self.mock_inventory.get_stock.side_effect = lambda prod_id: {"prod_1": 10, "prod_2": 5}[prod_id]
        # Mock payment success
        self.mock_payment.charge.return_value = True

        result = self.order.checkout()

        # Check return value & order status
        self.assertEqual(result, {"status": "success", "charged_amount": 117.0})
        self.assertTrue(self.order.is_paid)
        self.assertEqual(self.order.status, "COMPLETED")

        # Verify stock checks
        self.assertEqual(self.mock_inventory.get_stock.call_count, 2)
        self.mock_inventory.get_stock.assert_has_calls([call("prod_1"), call("prod_2")], any_order=True)

        # Verify payment charge
        self.mock_payment.charge.assert_called_once_with(117.0, "USD")

        # Verify inventory decrements
        self.assertEqual(self.mock_inventory.decrement_stock.call_count, 2)
        self.mock_inventory.decrement_stock.assert_has_calls(
            [call("prod_1", 2), call("prod_2", 1)], any_order=True
        )


if __name__ == "__main__":
    unittest.main()
