import {
  Button,
  Heading,
  reactExtension,
  Text,
  useApplyDiscountCodeChange,
  useCartLines,
  useDiscountCodes
} from "@shopify/ui-extensions-react/checkout";
import { InlineLayout } from "@shopify/ui-extensions/checkout";
import { useEffect, useState } from "react";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.reductions.render-before", () => (
  <Extension />
));

function Extension() {
  // Checkout data
  const cartItems = useCartLines();
  const discounts = useDiscountCodes();
  const applyDiscountCodeChange = useApplyDiscountCodeChange();

  // Local state
  const [isEligible, setIsEligible] = useState(false);
  const [isApplied, setIsApplied] = useState(false);


  // Use effect to check if customer is eligible for shipping discount
  useEffect(() => {
    if (cartItems.length >= 3) {
      setIsEligible(true);
    }
    else {
      setIsEligible(false);
      if (isApplied) {
        applyDiscountCodeChange({
          code: "FREESHIPPING2024",
          type: "removeDiscountCode"
        })
      }
    }
  }, [cartItems])

  // Use effect to check if discount applied
  useEffect(() => {
    if (discounts.find(discount => discount?.code === "FREESHIPPING2024")) {
      setIsApplied(true);
    }
    else {
      setIsApplied(false);
    }
  }, [discounts])

  function applyDiscount() {
    setIsApplied(true);
    applyDiscountCodeChange({
      code: "FREESHIPPING2024",
      type: "addDiscountCode"
    })
  }

  // Render button to add discount if eligible
  if (isEligible && !isApplied) {
    return (
      <InlineLayout columns={["fill", "auto"]} blockAlignment="center" padding="base">
        <Heading level={3}>You are eligible for free shipping discount!</Heading>
        <Button onPress={applyDiscount}>Apply Now</Button>
      </InlineLayout>
    )
  }
  
  return null;
}