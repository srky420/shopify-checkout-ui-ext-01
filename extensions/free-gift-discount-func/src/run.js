// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {

  // Target items to apply discount to
  const targets = [];

  // Iterate over cart lines
  input.cart.lines.forEach(item => {
    if (item.freeGift?.value) {
      targets.push({
        cartLine: {
          id: item.id
        }
      })
    }
  })

  // If targets is not empty, apply first discount to all targets
  if (targets.length) {
    return {
      discounts: [
        {
          targets: targets,
          value: {
            percentage: {
              value: "100.0"
            }
          }
        }
      ],
      discountApplicationStrategy: DiscountApplicationStrategy.All
    }
  }

  return EMPTY_DISCOUNT;
};