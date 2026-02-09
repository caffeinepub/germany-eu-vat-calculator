import { type VATCalculationInput, type VATCalculationResult } from './calculateVat';

export function explainVatLikeIm12(input: VATCalculationInput, result: VATCalculationResult): string {
  const { scenario } = result;

  switch (scenario) {
    case 'kleinunternehmer':
      return `You're a small business owner!

Because you don't make much money yet (less than €22,000 last year), Germany says you don't have to deal with VAT.

This means you don't add VAT to your prices. Your customers pay less, which is nice!

But there's a catch: you also can't get VAT back on things you buy for your business.

You just need to write on your invoices that you're using the small business rule (§19 UStG).`;

    case 'reverse-charge':
      return `This is like a special handshake between businesses!

When you sell to another business in the EU, you don't charge them VAT.

Instead, they handle the VAT themselves in their own country.

It's like saying "you take care of your taxes, I'll take care of mine."

Just make sure to write on the invoice that reverse charge applies.`;

    case 'digital-b2c-eu':
      return `Selling digital stuff across borders is tricky!

When you sell things like apps or online courses to people in other EU countries, you need to use their country's VAT rate, not Germany's.

It's like when you visit another country - you follow their rules, not yours.

There's a special system called OSS that makes this easier. It lets you report all your EU sales in one place.`;

    case 'b2c-reduced':
      return `Some things get a discount on VAT!

Books, food, and cultural stuff only have 7% VAT instead of the normal 19%.

Germany does this to make these important things more affordable.

You still charge VAT, just less of it. And you can still get VAT back on your business expenses.`;

    case 'b2c-standard':
    default:
      return `This is the normal way VAT works in Germany!

You add 19% VAT to your price. So if something costs €100, the customer pays €119.

You collect that €19 and give it to the tax office later.

But here's the good part: you can get back the VAT you paid on things you bought for your business.

It's like a cycle - you collect VAT from customers and get VAT back on your expenses.`;
  }
}
