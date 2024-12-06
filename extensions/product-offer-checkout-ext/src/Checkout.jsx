import {
  reactExtension,
  BlockStack,
  Checkbox,
  Text,
  useApi,
  InlineLayout,
  Heading,
  BlockSpacer,
  Divider,
  useCartLines,
  useApplyCartLinesChange,
  ProductThumbnail,
  SkeletonImage,
  SkeletonTextBlock,
  useSettings,
  Pressable,
  Button
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

function Extension() {
  const { query} = useApi();

  const variants = [];
  const cartItems = useCartLines();
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [similarProducts, setSimilarProducts] = useState([]);
  const settings = useSettings();
  const variantIds = [settings.selected_variant_01, settings.selected_variant_02, settings.selected_variant_03, settings.selected_variant_04].filter(id => {
    return id !== null && !cartItems.find(item => item.merchandise.id === id)
  });
  // const variantIds = ["gid://shopify/ProductVariant/46120531886302", "gid://shopify/ProductVariant/46120531886302", "gid://shopify/ProductVariant/46120531886302", ""];

  // Use effect to get similar products on first render
  useEffect(() => {
    fetchVariantData();
    setSimilarProducts(variants);
  }, [])

  // Fetch variants from API
  async function fetchVariantData() {
    setIsLoading(true);
    // Fetch data for each variant defined in settings
    for (const variantId of variantIds) {
      try {
        // Query API if variantId is valid
        const { data } = await query(`{
          node(id: "${variantId}") {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              image {
                url
                altText
              }
              product {
                title
                featuredImage {
                  url
                  altText
                }
              }
            }
          }
        }`);
        variants.push(data?.node);
      }
      catch (error) {
        console.error(error);
      }
    }
    setIsLoading(false);
  }

  // Render placeholders when loading
  if (isLoading) {
    return (
      <>
        <Heading level={2}>{settings.heading}</Heading>
        <BlockSpacer spacing="base" />
        <Divider />
        <BlockSpacer spacing="base" />
        <InlineLayout blockAlignment="center" spacing={["base", "base"]} columns={["auto", "fill"]} padding="base">
          <SkeletonImage
            inlineSize={50}
            blockSize={50}
          />
          <SkeletonTextBlock lines={3} />
        </InlineLayout>
      </>
    )
  }

  if (variantIds.length) {
    return (
      <>
        <Heading level={2}>{settings.heading}</Heading>
        <BlockSpacer spacing="base" />
        <Divider />
        <BlockSpacer spacing="base" />
        {similarProducts.map((variant, index) => 
          variant && 
          <VariantOffer isAdding={isAdding} setIsAdding={setIsAdding} variant={variant} key={index} />
        )}
      </>
    );
  }

  return null
}

function VariantOffer({ variant, isAdding, setIsAdding }) {

  // Cart line variables
  const applyCartLineChange = useApplyCartLinesChange();
  const [isAdded, setIsAdded] = useState(false);

  function addVariant() {
    setIsAdding(true);
    setIsAdded(true);
    applyCartLineChange({
      type: "addCartLine",
      merchandiseId: variant.id,
      quantity: 1
    }).finally(() => setIsAdding(false));
  }

  if (!isAdded) {
    return (
      <InlineLayout blockAlignment="center" spacing={["base", "base"]} columns={["auto", "fill", "auto"]} padding="base">
        <ProductThumbnail
          source={variant.image?.url || variant.product.featuredImage?.url}
        />
        <BlockStack>
          <Text>{variant.product.title} - {variant.title}</Text>
          <Text>{variant.price.amount} {variant.price.currencyCode}</Text>
        </BlockStack>
        <Button onPress={addVariant} disabled={isAdding}>Add</Button>
      </InlineLayout>
    )
  } 
  return null;
}