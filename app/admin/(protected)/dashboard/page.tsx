export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-muted rounded-lg p-5">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-semibold mt-2">125</p>
        </div>

        <div className="bg-muted rounded-lg p-5">
          <p className="text-sm text-muted-foreground">Total Products</p>
          <p className="text-2xl font-semibold mt-2">42</p>
        </div>

        <div className="bg-muted rounded-lg p-5">
          <p className="text-sm text-muted-foreground">Revenue</p>
          <p className="text-2xl font-semibold mt-2">₹1,25,000</p>
        </div>
      </div>
    </div>
  );
}
