import {
  reactExtension,
  SkeletonTextBlock,
  Text,
  useApi,
  useCartLineTarget
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.cart-line-item.render-after", () => (
  <Extension />
));

function Extension() {
  // Shopify hooks
  const { query } = useApi();
  const cartLineTarget = useCartLineTarget();

  // Local state
  const [loading, setLoading] = useState(true);
  const [metafield, setMetafield] = useState({});

  // Use effect to fetch product data
  useEffect(() => {
    const productId = cartLineTarget.merchandise.product.id;
    fetchProductData(productId);
  }, []);

  // Fetch product data
  async function fetchProductData(productId) {
    setLoading(true);
    try {
      const { data } = await query(`
        {
          product(id: "${productId}") {
            title
            metafield (key: "snowboard_length", namespace: "test_data") {
              value
            }
          }  
        }
      `);
      setMetafield(JSON.parse(data.product?.metafield.value))
    }
    catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false);
    }
  }

  // If loading, show placeholder
  if (loading) {
    return (
      <SkeletonTextBlock lines={1} />
    )
  }
  // Otherwise show metafield data
  return (
    <Text>{metafield.value} {metafield.unit}</Text>
  )
}