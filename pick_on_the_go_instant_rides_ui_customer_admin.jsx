import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { MapPin, ArrowRight, Car, Bus, CreditCard, Wallet, Phone, MessageCircle, Shield, Clock, Route, Search, LayoutDashboard, Users, Banknote, SlidersHorizontal, ReceiptText } from "lucide-react";

// -----------------------------------------------------------------------------
// PickOnTheGo Instant Rides UI (MVP)
// - Customer: Search → Estimate → Checkout → Confirmed → Track → My bookings
// - Admin: Rides → Ride details/assign → Drivers → Pricing → Payments → Reports
// NOTE: This is UI-only (no backend). Hook your APIs where indicated.
// -----------------------------------------------------------------------------

const money = (n) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const statusMeta = {
  requested: { label: "Requested", tone: "secondary" },
  assigned: { label: "Assigned", tone: "default" },
  arrived: { label: "Arrived", tone: "outline" },
  in_trip: { label: "In trip", tone: "default" },
  completed: { label: "Completed", tone: "default" },
  cancelled: { label: "Cancelled", tone: "destructive" },
};

function StatusBadge({ status }) {
  const m = statusMeta[status] || { label: status, tone: "secondary" };
  // Badge variants available vary by shadcn version; fallback to class-based styling.
  const klass =
    status === "cancelled"
      ? "bg-red-600 text-white"
      : status === "completed"
        ? "bg-emerald-600 text-white"
        : status === "assigned" || status === "in_trip"
          ? "bg-slate-900 text-white"
          : "bg-slate-100 text-slate-900";
  return <Badge className={klass}>{m.label}</Badge>;
}

function Stepper({ status }) {
  const steps = [
    { key: "requested", label: "Requested" },
    { key: "assigned", label: "Driver assigned" },
    { key: "arrived", label: "Driver arrived" },
    { key: "in_trip", label: "In trip" },
    { key: "completed", label: "Completed" },
  ];
  const idx = Math.max(0, steps.findIndex((s) => s.key === status));
  const pct = status === "cancelled" ? 0 : Math.round(((idx + 1) / steps.length) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>Trip progress</span>
        <span>{status === "cancelled" ? "Cancelled" : `${pct}%`}</span>
      </div>
      <Progress value={status === "cancelled" ? 10 : pct} />
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {steps.map((s, i) => {
          const active = status !== "cancelled" && i <= idx;
          return (
            <div
              key={s.key}
              className={`rounded-2xl border px-3 py-2 text-xs ${active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600"}`}
            >
              {s.label}
            </div>
          );
        })}
      </div>
      {status === "cancelled" ? (
        <Alert>
          <AlertTitle>Ride cancelled</AlertTitle>
          <AlertDescription>Booking is no longer active. You can book another ride anytime.</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

function AppShell({ mode, setMode, children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-slate-900 grid place-items-center text-white font-bold">P</div>
            <div className="leading-tight">
              <div className="font-semibold">PickOnTheGo</div>
              <div className="text-xs text-slate-500">Instant Rides MVP</div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Badge className="bg-slate-100 text-slate-900">Nigeria • NGN</Badge>
            <div className="hidden sm:flex items-center gap-2 rounded-2xl border bg-white px-2 py-1">
              <span className={`text-xs ${mode === "customer" ? "text-slate-900 font-medium" : "text-slate-500"}`}>Customer</span>
              <Switch checked={mode === "admin"} onCheckedChange={(v) => setMode(v ? "admin" : "customer")} />
              <span className={`text-xs ${mode === "admin" ? "text-slate-900 font-medium" : "text-slate-500"}`}>Admin</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs text-slate-500">
        <Separator className="my-6" />
        <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} PickOnTheGo. All rights reserved.</div>
          <div className="flex gap-3">
            <a className="hover:text-slate-900" href="#">Terms</a>
            <a className="hover:text-slate-900" href="#">Privacy</a>
            <a className="hover:text-slate-900" href="#">Safety</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ------------------------------
// Mock Data
// ------------------------------

const mockDrivers = [
  { id: "d1", name: "Adewale T.", phone: "0803 123 4567", type: "car", plate: "LND 123 AB", vehicle: "Toyota Corolla • Black", status: "available" },
  { id: "d2", name: "Ifeoma C.", phone: "0812 555 1122", type: "car", plate: "APP 908 ZY", vehicle: "Honda Accord • Silver", status: "busy" },
  { id: "d3", name: "Sani M.", phone: "0701 444 0001", type: "bus", plate: "LAG 221 RT", vehicle: "Hiace Shuttle • White", status: "available" },
];

const initialPricing = {
  car: { base: 1200, perKm: 250, perMin: 30, min: 1800 },
  bus: { base: 700, perKm: 120, perMin: 15, min: 1000 },
};

function estimateFare({ vehicleType, distanceKm, durationMin, pricing }) {
  const p = pricing[vehicleType];
  const raw = p.base + p.perKm * distanceKm + p.perMin * durationMin;
  return Math.max(p.min, Math.round(raw / 50) * 50);
}

// ------------------------------
// Customer UI
// ------------------------------

function CustomerApp({ pricing, onCreateRide, rides, onCancelRide, onMarkPaid }) {
  const [page, setPage] = useState("search");
  const [vehicleType, setVehicleType] = useState("car");
  const [pickup, setPickup] = useState("Lekki Phase 1 Gate");
  const [dropoff, setDropoff] = useState("Victoria Island");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [activeRideId, setActiveRideId] = useState(null);

  const computed = useMemo(() => {
    // For UI demo we use fixed distance/duration; wire this to Maps API in real build.
    const distanceKm = vehicleType === "car" ? 12.4 : 10.8;
    const durationMin = vehicleType === "car" ? 28 : 34;
    const fare = estimateFare({ vehicleType, distanceKm, durationMin, pricing });
    return { distanceKm, durationMin, fare };
  }, [vehicleType, pricing]);

  const activeRide = rides.find((r) => r.id === activeRideId) || null;

  function goEstimate() {
    if (!pickup.trim()) return alert("Please enter your pick-up location.");
    if (!dropoff.trim()) return alert("Please enter your destination.");
    if (pickup.trim().toLowerCase() === dropoff.trim().toLowerCase()) return alert("Pick-up and destination can’t be the same.");
    setPage("estimate");
  }

  function bookRide() {
    const ride = onCreateRide({
      vehicleType,
      pickup,
      dropoff,
      note,
      paymentMethod,
      estimatedFare: computed.fare,
      distanceKm: computed.distanceKm,
      durationMin: computed.durationMin,
    });
    setActiveRideId(ride.id);
    if (paymentMethod === "flutterwave") setPage("checkout");
    else setPage("confirmed");
  }

  function completeFlutterwavePayment() {
    // Replace with: POST /payments/flutterwave/init → redirect to Flutterwave
    // Then: handle return + webhook server-side.
    alert("Demo: Redirecting to Flutterwave checkout…\n\nIn production: open Flutterwave payment link.");
    setPage("confirmed");
  }

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-6">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-2xl font-semibold">Instant rides</div>
            <div className="text-slate-600">Choose <b>Car</b> (private) or <b>Bus</b> (shared). Pay with <b>Cash</b> or <b>Flutterwave</b>.</div>
          </div>
          <div className="flex gap-2">
            <Button variant={page === "search" ? "default" : "outline"} onClick={() => setPage("search")}>Search</Button>
            <Button variant={page === "bookings" ? "default" : "outline"} onClick={() => setPage("bookings")}>My bookings</Button>
          </div>
        </div>

        {page === "search" && (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Where are you going?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ride type</Label>
                  <Tabs value={vehicleType} onValueChange={setVehicleType}>
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="car" className="gap-2"><Car className="h-4 w-4" /> Car</TabsTrigger>
                      <TabsTrigger value="bus" className="gap-2"><Bus className="h-4 w-4" /> Bus</TabsTrigger>
                    </TabsList>
                    <TabsContent value="car" className="text-xs text-slate-600 mt-2">Private ride</TabsContent>
                    <TabsContent value="bus" className="text-xs text-slate-600 mt-2">Shared shuttle</TabsContent>
                  </Tabs>
                </div>
                <div className="rounded-2xl border bg-white p-4">
                  <div className="text-sm font-medium">Upfront pricing</div>
                  <div className="text-xs text-slate-600 mt-1">See your estimate before you book.</div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                    <Shield className="h-4 w-4" /> Safe & verified partners
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Where (Pick-up)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input value={pickup} onChange={(e) => setPickup(e.target.value)} className="pl-9" placeholder="Enter pick-up location" />
                  </div>
                  <div className="text-xs text-slate-500">Tip: Use a landmark (e.g., “Lekki Phase 1 Gate”).</div>
                </div>
                <div className="space-y-2">
                  <Label>To (Drop-off)</Label>
                  <div className="relative">
                    <ArrowRight className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <Input value={dropoff} onChange={(e) => setDropoff(e.target.value)} className="pl-9" placeholder="Enter destination" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pick-up note (optional)</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder='e.g., "I’m at the supermarket entrance"' />
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex gap-3 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> Fast pickup</span>
                  <span className="inline-flex items-center gap-1"><Route className="h-4 w-4" /> Smart routing</span>
                </div>
                <Button className="rounded-2xl" size="lg" onClick={goEstimate}>Get fare estimate</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {page === "estimate" && (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Confirm your ride</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border bg-white p-4">
                  <div className="text-sm font-medium">Ride summary</div>
                  <div className="mt-2 text-sm text-slate-700">
                    <div className="flex items-center justify-between"><span className="text-slate-500">Ride type</span><span className="font-medium capitalize">{vehicleType}</span></div>
                    <Separator className="my-2" />
                    <div className="flex items-start justify-between gap-2"><span className="text-slate-500">Pick-up</span><span className="text-right">{pickup}</span></div>
                    <div className="flex items-start justify-between gap-2 mt-1"><span className="text-slate-500">Destination</span><span className="text-right">{dropoff}</span></div>
                    {note?.trim() ? (
                      <div className="mt-2 text-xs text-slate-500">Note: {note}</div>
                    ) : null}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" onClick={() => setPage("search")}>Edit</Button>
                  </div>
                </div>

                <div className="rounded-2xl border bg-slate-900 text-white p-4">
                  <div className="text-sm font-medium">Fare estimate</div>
                  <div className="mt-2 text-3xl font-semibold">{money(computed.fare)}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-white/80">
                    <div className="rounded-2xl bg-white/10 p-3">
                      <div className="text-xs">Distance</div>
                      <div className="font-medium">{computed.distanceKm} km</div>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-3">
                      <div className="text-xs">Estimated time</div>
                      <div className="font-medium">{computed.durationMin} mins</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-white/70">Final fare may change slightly if route changes.</div>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4">
                <div className="text-sm font-medium">How would you like to pay?</div>
                <div className="mt-3 grid md:grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`text-left rounded-2xl border p-4 transition ${paymentMethod === "cash" ? "border-slate-900 ring-2 ring-slate-900/10" : "hover:border-slate-300"}`}
                  >
                    <div className="flex items-center gap-2 font-medium"><Wallet className="h-4 w-4" /> Cash</div>
                    <div className="text-xs text-slate-600 mt-1">Pay the driver when you arrive.</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("flutterwave")}
                    className={`text-left rounded-2xl border p-4 transition ${paymentMethod === "flutterwave" ? "border-slate-900 ring-2 ring-slate-900/10" : "hover:border-slate-300"}`}
                  >
                    <div className="flex items-center gap-2 font-medium"><CreditCard className="h-4 w-4" /> Flutterwave</div>
                    <div className="text-xs text-slate-600 mt-1">Pay securely with card or bank transfer.</div>
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-xs text-slate-600">By booking, you agree to our Terms & Safety rules.</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setPage("search")}>Cancel</Button>
                  <Button size="lg" className="rounded-2xl" onClick={bookRide}>Book ride</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {page === "checkout" && activeRide && (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Complete your payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border bg-white p-4">
                <div className="text-sm font-medium">Order summary</div>
                <div className="mt-2 text-sm text-slate-700">
                  <div className="flex items-center justify-between"><span className="text-slate-500">Ride type</span><span className="font-medium capitalize">{activeRide.vehicleType}</span></div>
                  <div className="flex items-center justify-between mt-1"><span className="text-slate-500">Route</span><span className="font-medium">{activeRide.pickup} → {activeRide.dropoff}</span></div>
                  <div className="flex items-center justify-between mt-1"><span className="text-slate-500">Amount</span><span className="font-semibold">{money(activeRide.estimatedFare)}</span></div>
                  <div className="flex items-center justify-between mt-1"><span className="text-slate-500">Provider</span><span className="font-medium">Flutterwave</span></div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <Button size="lg" className="rounded-2xl" onClick={completeFlutterwavePayment}>Pay with Flutterwave</Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="rounded-2xl">Switch to Cash</Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Switch to Cash?</DialogTitle>
                      <DialogDescription>You’ll pay the driver in cash at pickup.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline">No, stay with Flutterwave</Button>
                      <Button
                        onClick={() => {
                          // Update active ride payment method
                          // In production: PATCH /rides/:id payment_method
                          activeRide.paymentMethod = "cash";
                          setPage("confirmed");
                        }}
                      >
                        Yes, switch to Cash
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="text-xs text-slate-600">In production: initialize payment on your server and redirect to Flutterwave checkout.</div>
            </CardContent>
          </Card>
        )}

        {page === "confirmed" && activeRide && (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>Booking received ✅</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border bg-white p-4">
                  <div className="text-sm font-medium">Ride details</div>
                  <div className="mt-2 text-sm text-slate-700 space-y-1">
                    <div className="flex items-center justify-between"><span className="text-slate-500">Ride ID</span><span className="font-mono">{activeRide.publicId}</span></div>
                    <div className="flex items-center justify-between"><span className="text-slate-500">Ride type</span><span className="capitalize font-medium">{activeRide.vehicleType}</span></div>
                    <div className="flex items-center justify-between"><span className="text-slate-500">Payment</span><span className="font-medium capitalize">{activeRide.paymentMethod}</span></div>
                    <div className="flex items-center justify-between"><span className="text-slate-500">Estimated fare</span><span className="font-semibold">{money(activeRide.estimatedFare)}</span></div>
                    <Separator className="my-2" />
                    <div className="text-slate-600 text-xs">Pick-up</div>
                    <div>{activeRide.pickup}</div>
                    <div className="text-slate-600 text-xs mt-2">Destination</div>
                    <div>{activeRide.dropoff}</div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-white p-4">
                  <div className="text-sm font-medium">Driver status</div>
                  <div className="mt-3">
                    {activeRide.assignment ? (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold">{activeRide.assignment.driver.name}</div>
                            <div className="text-xs text-slate-600">{activeRide.assignment.driver.vehicle}</div>
                            <div className="text-xs text-slate-600">Plate: {activeRide.assignment.driver.plate}</div>
                          </div>
                          <Badge className="bg-slate-900 text-white">ETA {activeRide.assignment.etaMin} mins</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" className="rounded-2xl gap-2"><Phone className="h-4 w-4" /> Call driver</Button>
                          <Button variant="outline" className="rounded-2xl gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
                        </div>
                      </div>
                    ) : (
                      <Alert>
                        <AlertTitle>Searching for a driver…</AlertTitle>
                        <AlertDescription>Please keep your phone available. A driver will be assigned shortly.</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <Button variant="outline" onClick={() => setPage("search")}>Book another ride</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onCancelRide(activeRide.id)}>Cancel ride</Button>
                  <Button size="lg" className="rounded-2xl" onClick={() => setPage("track")}>Track ride</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {page === "track" && activeRide && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold">Track your ride</div>
                <div className="text-slate-600">Ride <span className="font-mono">{activeRide.publicId}</span> • <StatusBadge status={activeRide.status} /></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setPage("confirmed")}>Back</Button>
                <Button variant="outline" onClick={() => onCancelRide(activeRide.id)}>Cancel</Button>
              </div>
            </div>

            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-6 space-y-6">
                <Stepper status={activeRide.status} />

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl border bg-white p-4">
                    <div className="text-sm font-medium">Route</div>
                    <div className="mt-2 text-sm text-slate-700">
                      <div className="text-xs text-slate-500">Pick-up</div>
                      <div>{activeRide.pickup}</div>
                      <div className="text-xs text-slate-500 mt-2">Destination</div>
                      <div>{activeRide.dropoff}</div>
                    </div>
                  </div>
                  <div className="rounded-2xl border bg-white p-4">
                    <div className="text-sm font-medium">Driver</div>
                    {activeRide.assignment ? (
                      <div className="mt-2 text-sm text-slate-700 space-y-2">
                        <div className="font-semibold">{activeRide.assignment.driver.name}</div>
                        <div className="text-xs text-slate-600">{activeRide.assignment.driver.vehicle}</div>
                        <div className="text-xs text-slate-600">Plate: {activeRide.assignment.driver.plate}</div>
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" className="rounded-2xl gap-2"><Phone className="h-4 w-4" /> Call</Button>
                          <Button variant="outline" className="rounded-2xl gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-slate-600">Not assigned yet.</div>
                    )}
                  </div>
                </div>

                <Alert>
                  <AlertTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> Safety</AlertTitle>
                  <AlertDescription>If you feel unsafe, call emergency services immediately.</AlertDescription>
                </Alert>

                {activeRide.status === "completed" && activeRide.paymentMethod === "cash" ? (
                  <div className="flex items-center justify-between rounded-2xl border bg-white p-4">
                    <div>
                      <div className="font-medium">Cash confirmation</div>
                      <div className="text-xs text-slate-600">Please confirm you’ve paid the driver.</div>
                    </div>
                    <Button className="rounded-2xl" onClick={() => onMarkPaid(activeRide.id)}>I have paid</Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        )}

        {page === "bookings" && (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle>My bookings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rides.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-lg font-semibold">No bookings yet</div>
                  <div className="text-slate-600 mt-1">When you book a ride, it will appear here.</div>
                  <Button className="mt-4 rounded-2xl" onClick={() => setPage("search")}>Book a ride</Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {rides
                    .slice()
                    .reverse()
                    .map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setActiveRideId(r.id);
                          setPage("confirmed");
                        }}
                        className="w-full text-left rounded-2xl border bg-white p-4 hover:border-slate-300 transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-semibold">{r.publicId} • <span className="capitalize">{r.vehicleType}</span></div>
                            <div className="text-sm text-slate-600">{r.pickup} → {r.dropoff}</div>
                            <div className="text-xs text-slate-500 mt-1">Payment: <span className="capitalize">{r.paymentMethod}</span> • {money(r.estimatedFare)}</div>
                          </div>
                          <StatusBadge status={r.status} />
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right rail: quick panel */}
      <div className="space-y-4">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full rounded-2xl" onClick={() => setPage("search")}>Book a ride</Button>
            <Button variant="outline" className="w-full rounded-2xl" onClick={() => setPage("bookings")}>View my bookings</Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Need help?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 space-y-3">
            <div>Call/WhatsApp support for quick help with your booking.</div>
            <div className="flex gap-2">
              <Button variant="outline" className="rounded-2xl gap-2"><Phone className="h-4 w-4" /> Call</Button>
              <Button variant="outline" className="rounded-2xl gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ------------------------------
// Admin UI
// ------------------------------

function AdminApp({ pricing, setPricing, rides, drivers, onAssignDriver, onUpdateRideStatus }) {
  const [tab, setTab] = useState("rides");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [selectedRideId, setSelectedRideId] = useState(null);

  const filteredRides = useMemo(() => {
    return rides.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (typeFilter !== "all" && r.vehicleType !== typeFilter) return false;
      if (paymentFilter !== "all" && r.paymentMethod !== paymentFilter) return false;
      return true;
    });
  }, [rides, statusFilter, typeFilter, paymentFilter]);

  const selectedRide = rides.find((r) => r.id === selectedRideId) || null;

  return (
    <div className="grid lg:grid-cols-[260px_1fr] gap-6">
      <Card className="rounded-2xl h-fit">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><LayoutDashboard className="h-4 w-4" /> Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <NavItem active={tab === "rides"} onClick={() => setTab("rides")} icon={<ReceiptText className="h-4 w-4" />} label="Ride requests" />
          <NavItem active={tab === "drivers"} onClick={() => setTab("drivers")} icon={<Users className="h-4 w-4" />} label="Drivers" />
          <NavItem active={tab === "pricing"} onClick={() => setTab("pricing")} icon={<SlidersHorizontal className="h-4 w-4" />} label="Pricing" />
          <NavItem active={tab === "payments"} onClick={() => setTab("payments")} icon={<Banknote className="h-4 w-4" />} label="Payments" />
          <NavItem active={tab === "reports"} onClick={() => setTab("reports")} icon={<LayoutDashboard className="h-4 w-4" />} label="Reports" />
        </CardContent>
      </Card>

      <div className="space-y-6">
        {tab === "rides" && (
          <>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div>
                <div className="text-2xl font-semibold">Ride requests</div>
                <div className="text-slate-600">Dispatch and manage bookings.</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="requested">Requested</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="arrived">Arrived</SelectItem>
                    <SelectItem value="in_trip">In trip</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="rounded-2xl"><SelectValue placeholder="Payment" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All payments</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="flutterwave">Flutterwave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_420px] gap-6">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Incoming requests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {filteredRides.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="text-lg font-semibold">No ride requests</div>
                      <div className="text-slate-600 mt-1">New requests will show up here automatically.</div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredRides
                        .slice()
                        .reverse()
                        .map((r) => (
                          <button
                            key={r.id}
                            onClick={() => setSelectedRideId(r.id)}
                            className={`w-full text-left rounded-2xl border p-4 transition ${selectedRideId === r.id ? "border-slate-900 bg-white" : "bg-white hover:border-slate-300"}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-semibold">{r.publicId} • <span className="capitalize">{r.vehicleType}</span></div>
                                <div className="text-sm text-slate-600">{r.pickup} → {r.dropoff}</div>
                                <div className="text-xs text-slate-500 mt-1">{money(r.estimatedFare)} • <span className="capitalize">{r.paymentMethod}</span> • {new Date(r.createdAt).toLocaleString()}</div>
                              </div>
                              <StatusBadge status={r.status} />
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Ride details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {!selectedRide ? (
                    <div className="text-sm text-slate-600">Select a ride request to view details and assign a driver.</div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="font-mono text-sm">{selectedRide.publicId}</div>
                          <StatusBadge status={selectedRide.status} />
                        </div>
                        <div className="text-sm text-slate-700">
                          <div className="flex items-start justify-between gap-2"><span className="text-slate-500">Type</span><span className="capitalize font-medium">{selectedRide.vehicleType}</span></div>
                          <div className="flex items-start justify-between gap-2 mt-1"><span className="text-slate-500">Payment</span><span className="capitalize font-medium">{selectedRide.paymentMethod}</span></div>
                          <div className="flex items-start justify-between gap-2 mt-1"><span className="text-slate-500">Estimate</span><span className="font-semibold">{money(selectedRide.estimatedFare)}</span></div>
                        </div>
                        <Separator className="my-2" />
                        <div className="text-xs text-slate-500">Pickup</div>
                        <div className="text-sm">{selectedRide.pickup}</div>
                        <div className="text-xs text-slate-500 mt-2">Destination</div>
                        <div className="text-sm">{selectedRide.dropoff}</div>
                        {selectedRide.note ? <div className="text-xs text-slate-500 mt-2">Note: {selectedRide.note}</div> : null}
                      </div>

                      <AssignDriver
                        ride={selectedRide}
                        drivers={drivers}
                        onAssign={(driverId, etaMin) => onAssignDriver(selectedRide.id, driverId, etaMin)}
                      />

                      <div className="rounded-2xl border bg-white p-4 space-y-3">
                        <div className="text-sm font-medium">Update status</div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" onClick={() => onUpdateRideStatus(selectedRide.id, "arrived")}>Arrived</Button>
                          <Button variant="outline" onClick={() => onUpdateRideStatus(selectedRide.id, "in_trip")}>In trip</Button>
                          <Button variant="outline" onClick={() => onUpdateRideStatus(selectedRide.id, "completed")}>Completed</Button>
                          <Button variant="outline" onClick={() => onUpdateRideStatus(selectedRide.id, "cancelled")}>Cancelled</Button>
                        </div>
                        <div className="text-xs text-slate-500">In production: restrict transitions based on current status.</div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {tab === "drivers" && (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Drivers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {drivers.map((d) => (
                  <div key={d.id} className="rounded-2xl border bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{d.name}</div>
                        <div className="text-xs text-slate-600">{d.vehicle}</div>
                        <div className="text-xs text-slate-600">Plate: {d.plate}</div>
                      </div>
                      <Badge className={d.status === "available" ? "bg-emerald-600 text-white" : d.status === "busy" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"}>
                        {d.status}
                      </Badge>
                    </div>
                    <Separator className="my-3" />
                    <div className="text-xs text-slate-500">Type</div>
                    <div className="text-sm capitalize font-medium">{d.type}</div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" className="rounded-2xl gap-2"><Phone className="h-4 w-4" /> Call</Button>
                      <Button variant="outline" className="rounded-2xl gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {tab === "pricing" && (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Pricing rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="car">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="car" className="gap-2"><Car className="h-4 w-4" /> Car pricing</TabsTrigger>
                  <TabsTrigger value="bus" className="gap-2"><Bus className="h-4 w-4" /> Bus pricing</TabsTrigger>
                </TabsList>

                {(["car", "bus"]).map((vt) => (
                  <TabsContent key={vt} value={vt} className="mt-4">
                    <PricingForm
                      title={vt === "car" ? "Car pricing" : "Bus pricing"}
                      value={pricing[vt]}
                      onChange={(next) => setPricing((prev) => ({ ...prev, [vt]: next }))}
                    />
                  </TabsContent>
                ))}
              </Tabs>
              <Alert>
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>Changes apply to new estimates only. Existing bookings keep their quoted fare.</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {tab === "payments" && (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rides.filter((r) => r.paymentMethod === "flutterwave").length === 0 ? (
                <div className="text-sm text-slate-600">No Flutterwave payments yet.</div>
              ) : (
                <div className="space-y-2">
                  {rides
                    .filter((r) => r.paymentMethod === "flutterwave")
                    .slice()
                    .reverse()
                    .map((r) => (
                      <div key={r.id} className="rounded-2xl border bg-white p-4 flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">{r.publicId}</div>
                          <div className="text-sm text-slate-600">{money(r.estimatedFare)} • Tx_ref: <span className="font-mono">{r.txRef}</span></div>
                          <div className="text-xs text-slate-500">Status: {r.paymentStatus}</div>
                        </div>
                        <Button variant="outline" className="rounded-2xl">Verify</Button>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {tab === "reports" && (
          <Reports rides={rides} />
        )}
      </div>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition ${active ? "bg-slate-900 text-white" : "bg-white hover:bg-slate-100 text-slate-700"}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function AssignDriver({ ride, drivers, onAssign }) {
  const eligible = drivers.filter((d) => d.type === ride.vehicleType && d.status === "available");
  const [driverId, setDriverId] = useState(eligible[0]?.id || "");
  const [etaMin, setEtaMin] = useState("10");

  return (
    <div className="rounded-2xl border bg-white p-4 space-y-3">
      <div className="text-sm font-medium">Assign driver</div>

      {ride.assignment ? (
        <Alert>
          <AlertTitle>Driver already assigned</AlertTitle>
          <AlertDescription>
            {ride.assignment.driver.name} • ETA {ride.assignment.etaMin} mins
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-3">
        <div className="space-y-2">
          <Label>Select driver</Label>
          <Select value={driverId} onValueChange={setDriverId}>
            <SelectTrigger className="rounded-2xl"><SelectValue placeholder={eligible.length ? "Select a driver" : "No available drivers"} /></SelectTrigger>
            <SelectContent>
              {eligible.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name} • {d.plate}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {eligible.length === 0 ? (
            <div className="text-xs text-amber-700">No available drivers for this vehicle type.</div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Driver ETA (minutes)</Label>
          <Input className="rounded-2xl" value={etaMin} onChange={(e) => setEtaMin(e.target.value)} placeholder="e.g., 10" />
        </div>

        <Button
          className="rounded-2xl"
          disabled={!driverId || eligible.length === 0 || !!ride.assignment}
          onClick={() => {
            const eta = Math.max(1, parseInt(etaMin || "10", 10) || 10);
            onAssign(driverId, eta);
          }}
        >
          Assign driver
        </Button>

        <div className="text-xs text-slate-500">MVP: Send trip details to driver via WhatsApp/SMS.</div>
      </div>
    </div>
  );
}

function PricingForm({ title, value, onChange }) {
  const [local, setLocal] = useState(value);

  function sync(k, v) {
    const n = { ...local, [k]: Number(v) };
    setLocal(n);
    onChange(n);
  }

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="font-semibold">{title}</div>
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <Field label="Base fare (₦)">
          <Input className="rounded-2xl" value={local.base} onChange={(e) => sync("base", e.target.value)} />
        </Field>
        <Field label="Per km (₦)">
          <Input className="rounded-2xl" value={local.perKm} onChange={(e) => sync("perKm", e.target.value)} />
        </Field>
        <Field label="Per minute (₦)">
          <Input className="rounded-2xl" value={local.perMin} onChange={(e) => sync("perMin", e.target.value)} />
        </Field>
        <Field label="Minimum fare (₦)">
          <Input className="rounded-2xl" value={local.min} onChange={(e) => sync("min", e.target.value)} />
        </Field>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-slate-500">Save changes to apply to new fare estimates.</div>
        <Button className="rounded-2xl">Save changes</Button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Reports({ rides }) {
  const today = new Date().toDateString();
  const todayRides = rides.filter((r) => new Date(r.createdAt).toDateString() === today);
  const completed = rides.filter((r) => r.status === "completed");
  const flutterRevenue = rides
    .filter((r) => r.paymentMethod === "flutterwave" && r.paymentStatus === "success")
    .reduce((sum, r) => sum + r.estimatedFare, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-2xl font-semibold">Reports</div>
        <div className="text-slate-600">Basic operational metrics (MVP).</div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi title="Rides today" value={String(todayRides.length)} />
        <Kpi title="Completed" value={String(completed.length)} />
        <Kpi title="Flutterwave revenue" value={money(flutterRevenue)} />
        <Kpi title="Cash rides" value={String(rides.filter((r) => r.paymentMethod === "cash").length)} />
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Recent rides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {rides.slice().reverse().slice(0, 8).map((r) => (
            <div key={r.id} className="rounded-2xl border bg-white p-4 flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{r.publicId} • <span className="capitalize">{r.vehicleType}</span></div>
                <div className="text-sm text-slate-600">{r.pickup} → {r.dropoff}</div>
                <div className="text-xs text-slate-500 mt-1">{money(r.estimatedFare)} • <span className="capitalize">{r.paymentMethod}</span> • {new Date(r.createdAt).toLocaleString()}</div>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

// ------------------------------
// Root
// ------------------------------

export default function PickOnTheGoMVP() {
  const [mode, setMode] = useState("customer");
  const [pricing, setPricing] = useState(initialPricing);

  const [rides, setRides] = useState(() => {
    // Seed with one sample ride
    const seedId = cryptoRandomId();
    return [
      {
        id: seedId,
        publicId: "PTG-482019",
        vehicleType: "car",
        pickup: "Lekki Phase 1 Gate",
        dropoff: "Victoria Island",
        note: "",
        estimatedFare: 4500,
        distanceKm: 12.4,
        durationMin: 28,
        paymentMethod: "cash",
        paymentStatus: "n/a",
        txRef: null,
        status: "requested",
        createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        assignment: null,
        cashConfirmed: false,
      },
    ];
  });

  const [drivers, setDrivers] = useState(mockDrivers);

  function onCreateRide(payload) {
    const id = cryptoRandomId();
    const publicId = `PTG-${String(Math.floor(100000 + Math.random() * 900000))}`;
    const txRef = payload.paymentMethod === "flutterwave" ? `PTG_TX_${Date.now()}_${Math.floor(Math.random() * 10000)}` : null;
    const paymentStatus = payload.paymentMethod === "flutterwave" ? "pending" : "n/a";

    const ride = {
      id,
      publicId,
      vehicleType: payload.vehicleType,
      pickup: payload.pickup,
      dropoff: payload.dropoff,
      note: payload.note,
      estimatedFare: payload.estimatedFare,
      distanceKm: payload.distanceKm,
      durationMin: payload.durationMin,
      paymentMethod: payload.paymentMethod,
      paymentStatus,
      txRef,
      status: "requested",
      createdAt: new Date().toISOString(),
      assignment: null,
      cashConfirmed: false,
    };

    setRides((prev) => [...prev, ride]);
    return ride;
  }

  function onCancelRide(rideId) {
    setRides((prev) => prev.map((r) => (r.id === rideId ? { ...r, status: "cancelled" } : r)));
  }

  function onMarkPaid(rideId) {
    setRides((prev) => prev.map((r) => (r.id === rideId ? { ...r, cashConfirmed: true } : r)));
    alert("Thanks! Cash payment confirmed (demo). In production: store confirmation in DB.");
  }

  function onAssignDriver(rideId, driverId, etaMin) {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    // Mark driver busy
    setDrivers((prev) => prev.map((d) => (d.id === driverId ? { ...d, status: "busy" } : d)));

    setRides((prev) =>
      prev.map((r) =>
        r.id === rideId
          ? {
              ...r,
              status: "assigned",
              assignment: {
                driver: { id: driver.id, name: driver.name, plate: driver.plate, vehicle: driver.vehicle, phone: driver.phone },
                etaMin,
                assignedAt: new Date().toISOString(),
              },
            }
          : r
      )
    );

    alert(`Driver assigned (demo): ${driver.name} • ETA ${etaMin} mins.\n\nIn production: notify driver via WhatsApp/SMS.`);
  }

  function onUpdateRideStatus(rideId, status) {
    setRides((prev) => prev.map((r) => (r.id === rideId ? { ...r, status } : r)));
  }

  return (
    <AppShell mode={mode} setMode={setMode}>
      {mode === "customer" ? (
        <CustomerApp
          pricing={pricing}
          onCreateRide={onCreateRide}
          rides={rides}
          onCancelRide={onCancelRide}
          onMarkPaid={onMarkPaid}
        />
      ) : (
        <AdminApp
          pricing={pricing}
          setPricing={setPricing}
          rides={rides}
          drivers={drivers}
          onAssignDriver={onAssignDriver}
          onUpdateRideStatus={onUpdateRideStatus}
        />
      )}
    </AppShell>
  );
}

function cryptoRandomId() {
  // Browser-safe UUID-ish
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
