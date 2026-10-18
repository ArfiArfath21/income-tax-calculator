# Income Tax Calculator

A small client-side calculator that compares your Indian income tax under the **Old** and **New** tax regimes and shows which one costs less. It runs entirely in the browser; nothing you enter is sent anywhere.

Live site: <https://tax-calculator.arfath.me>

## What it does

- Takes salary, other income, HRA details and the common deductions (Section 80C, 80D, home loan interest, NPS 80CCD(1B), savings interest 80TTA, education loan interest, donations).
- Computes taxable income and tax for both regimes, adds 4% health and education cess, and highlights the cheaper regime.
- Suggests tax-saving tips based on the numbers.

## Assumptions

The slabs follow the **FY 2025-26** rules:

- **New regime:** ₹75,000 standard deduction, slabs of 5% / 10% / 15% / 20% / 25% / 30% from ₹4 lakh. Section 87A makes tax nil up to ₹12 lakh of taxable income (₹12.75 lakh of salary), with marginal relief just above it.
- **Old regime:** slabs of 5% / 20% / 30% from ₹2.5 lakh and the Section 87A rebate up to ₹5 lakh.

## Known limitations

- Surcharge on very high incomes is not calculated.
- The old-regime calculation does not apply the ₹50,000 standard deduction for salaried individuals.
- This is an estimate, not tax advice. Check the numbers against the Income Tax Department's official calculator before filing.

## Run locally

It is a static site: open `index.html` in a browser, or serve the folder with any static file server.

## Tests

The new-regime tax function has tests that use Node's built-in runner (Node 18 or newer):

```sh
node --test test/new-regime.test.js
```
