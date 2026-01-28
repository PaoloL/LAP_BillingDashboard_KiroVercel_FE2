const apiUrl = "https://lq00597vce.execute-api.eu-west-1.amazonaws.com/dev/dashboard/summary";

fetch(apiUrl)
  .then(res => res.json())
  .then(data => {
    console.log("API Response:", JSON.stringify(data, null, 2));
    console.log("\nTotals:");
    console.log("Seller:", data.data.totals.seller);
    console.log("Customer:", data.data.totals.customer);
    console.log("Deposit:", data.data.totals.deposit);
    console.log("Margin:", data.data.totals.margin);
  })
  .catch(err => console.error("Error:", err));
