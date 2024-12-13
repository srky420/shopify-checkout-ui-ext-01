import {
  reactExtension,
  Text,
  useApplyCartLinesChange,
  useCartLines,
  useSettings,
  useSubtotalAmount
} from "@shopify/ui-extensions-react/checkout";
import { useEffect } from "react";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {

  // Shopify hooks
  const settings = useSettings();
  const subTotal = useSubtotalAmount();
  const applyCartLineChange = useApplyCartLinesChange();
  const cartLines = useCartLines();

  // Get the free gift variant from settings
  const firstGiftVariant = settings.first_free_variant;
  const secondGiftVariant = settings.second_free_variant;
  const thirdGiftVariant = settings.third_free_variant;

  // Get price thresholds from settings
  const firstThreshold = settings.first_tier_threshold;
  const secondThreshold = settings.second_tier_threshold;
  const thirdThreshold = settings.third_tier_threshold;

  useEffect(() => {
    checkForThresholdAndAddFreeGift();
  }, [])
 
  function checkForThresholdAndAddFreeGift() {

    // First threshold reached?
    if (firstThreshold && subTotal.amount >= firstThreshold) {

      const freeGiftItem = getFreeGiftItem(firstGiftVariant);
      if (!freeGiftItem) {
        addFreeGift(firstGiftVariant);
      }
      console.log("First tier")
    }
    else {
      removeFreeGift(firstGiftVariant);
    }

    // Second threshold reached?
    if (secondThreshold && subTotal.amount >= secondThreshold) {

      const freeGiftItem = getFreeGiftItem(secondGiftVariant);
      if (!freeGiftItem) {
        addFreeGift(secondGiftVariant);
      }
      console.log("Second tier")
    }
    else {
      removeFreeGift(secondGiftVariant);
    }

    // Third threshold reached?
    if (thirdThreshold && subTotal.amount >= thirdThreshold) {

      const freeGiftItem = getFreeGiftItem(thirdGiftVariant);
      if (!freeGiftItem) {
        addFreeGift(thirdGiftVariant);
      }
      console.log("Third tier")
    }
    else {
      removeFreeGift(thirdGiftVariant);
    }
  }
  

  // Get the free gift item from cart
  function getFreeGiftItem(variantId) {
    const cartItem = cartLines.find(item => {
      if (item.merchandise.id === variantId && item.attributes.find(attr => attr?.key === "freeGift" && attr?.value === "true")) {
        return true;
      }
      return false;
    });
    return cartItem;
  }

  // Adds a variant to the cart with freeGift attribute
  async function addFreeGift(variantId) {
    try {
      await applyCartLineChange({
        type: "addCartLine",
        merchandiseId: variantId,
        quantity: 1,
        attributes: [
          {
            key: "freeGift",
            value: "true"
          }
        ]
      });
    }
    catch (error) {
      console.log(error);
    }
  }

  // Removes a variant from the cart
  async function removeFreeGift(variantId) {
    const cartItem = cartLines.find(item => {
      if (item.merchandise.id === variantId && item.attributes.find(attr => attr?.key === "freeGift" && attr?.value === "true")) {
        return true;
      }
      return false;
    });
    if (cartItem) {
      try {
        await applyCartLineChange({
          type: "removeCartLine",
          id: cartItem.id,
          quantity: 1
        });
      }
      catch (error) {
        console.log(error);
      }
    }
  }

  return null
}