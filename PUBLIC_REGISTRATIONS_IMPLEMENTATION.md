# Public Registrations Implementation Guide

## Overview
Add a clean way to view public event registrations (from the new public registration flow) in the admin dashboard.

## Step 1: Database Table (Run in Supabase SQL Editor)

```sql
CREATE TABLE public_event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id),
  registration_group TEXT NOT NULL, -- 'group1' or 'group2'
  full_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  gender TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  title TEXT NOT NULL,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  payment_modes TEXT[] NOT NULL, -- Array of: 'cash', 'mobileMoney', 'bankTransfer'
  registration_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_public_registrations_event ON public_event_registrations(event_id);
CREATE INDEX idx_public_registrations_email ON public_event_registrations(email);
CREATE INDEX idx_public_registrations_status ON public_event_registrations(status);
```

## Step 2: Update Backend (server/routes.ts)

Update the `/api/events/public-register` endpoint to store in database:

```typescript
// Add after the existing public registration endpoint
app.get("/api/admin/public-registrations", authenticateSupabase, requireRoles([Roles.SuperAdmin, Roles.Finance, Roles.EventManager]), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("public_event_registrations")
      .select(`
        *,
        events (
          id,
          title,
          start_date,
          location
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ publicRegistrations: data || [] });
  } catch (error: any) {
    console.error("Error fetching public registrations:", error);
    res.status(500).json({
      message: "Failed to fetch public registrations",
      details: error.message,
    });
  }
});
```

And update the POST endpoint to save to database:

```typescript
// Replace the existing console.log with actual database insert
const { data: registration, error } = await supabase
  .from("public_event_registrations")
  .insert({
    event_id: eventId,
    registration_group: group,
    full_name: fullName,
    institution,
    gender,
    email,
    phone_number: phoneNumber,
    title,
    province,
    district,
    payment_modes: paymentModes,
    registration_number: `PUB-${Date.now()}`,
    status: "pending",
  })
  .select()
  .single();

if (error) throw error;
```

## Step 3: Update Admin Dashboard UI

### 3.1 Add state for public registrations (around line 200)

```typescript
const [publicRegistrations, setPublicRegistrations] = useState<any[]>([]);
```

### 3.2 Fetch public registrations in refreshData function (around line 700)

```typescript
// Fetch public registrations
try {
  const publicRegsResponse = await fetch(`/api/admin/public-registrations`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  if (publicRegsResponse.ok) {
    const { publicRegistrations: publicRegsData } = await publicRegsResponse.json();
    setPublicRegistrations(publicRegsData || []);
  }
} catch (err) {
  console.error("Error fetching public registrations:", err);
}
```

### 3.3 Add new tab trigger (around line 1800, in the TabsList)

```typescript
{/* Public Registrations - All admin roles can see */}
<TabsTrigger
  value="public-registrations"
  className="data-[state=active]:bg-[#1C356B] data-[state=active]:text-white data-[state=active]:shadow-sm text-xs sm:text-sm px-2 sm:px-4"
>
  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
  <span className="hidden xs:inline">Public Regs</span>
  {publicRegistrations.length > 0 && (
    <Badge className="ml-2 bg-[#FDC123] text-white">
      {publicRegistrations.length}
    </Badge>
  )}
</TabsTrigger>
```

### 3.4 Add TabsContent section (after the registrations TabsContent, around line 2900)

```typescript
<TabsContent value="public-registrations">
  <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-sm">
    <CardHeader className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#1C356B]" />
            Public Event Registrations
          </CardTitle>
          <CardDescription className="text-gray-600 mt-1">
            View and manage public registrations from the website
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-base px-4 py-2">
            {publicRegistrations.length} Total
          </Badge>
          <Button
            onClick={() => exportToExcel("public-registrations")}
            variant="outline"
            size="sm"
            className="border-[#1C356B] text-[#1C356B] hover:bg-[#1C356B] hover:text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Registration #</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Province</TableHead>
              <TableHead>Payment Modes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {publicRegistrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                  No public registrations yet
                </TableCell>
              </TableRow>
            ) : (
              publicRegistrations.map((reg) => (
                <TableRow key={reg.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-sm">
                    {reg.registration_number}
                  </TableCell>
                  <TableCell className="font-medium">{reg.full_name}</TableCell>
                  <TableCell>{reg.email}</TableCell>
                  <TableCell>{reg.phone_number}</TableCell>
                  <TableCell>{reg.institution}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {reg.registration_group === "group1" ? "Group 1 (25-27 Mar)" : "Group 2 (30 Mar-2 Apr)"}
                    </Badge>
                  </TableCell>
                  <TableCell>{reg.province}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {reg.payment_modes?.map((mode: string) => (
                        <Badge key={mode} variant="secondary" className="text-xs">
                          {mode === "cash" ? "💵 Cash" : mode === "mobileMoney" ? "📱 Mobile" : "🏦 Bank"}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(reg.status || "pending")}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatTime(reg.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          // Mark as confirmed
                          handleUpdatePublicRegistrationStatus(reg.id, "confirmed");
                        }}>
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          Mark as Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          // View details
                          alert(`Details:\n\nName: ${reg.full_name}\nEmail: ${reg.email}\nPhone: ${reg.phone_number}\nInstitution: ${reg.institution}\nTitle: ${reg.title}\nGender: ${reg.gender}\nProvince: ${reg.province}\nDistrict: ${reg.district}\nGroup: ${reg.registration_group}\nPayment Modes: ${reg.payment_modes?.join(", ")}`);
                        }}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {isSuperAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeletePublicRegistration(reg.id, reg.full_name)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

### 3.5 Add handler functions (around line 900)

```typescript
const handleUpdatePublicRegistrationStatus = async (registrationId: string, newStatus: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("public_event_registrations")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", registrationId);

    if (error) throw error;

    toast({
      title: "Status Updated",
      description: `Registration marked as ${newStatus}`,
    });

    await refreshData();
  } catch (error: any) {
    toast({
      title: "Update Failed",
      description: error.message,
      variant: "destructive",
    });
  }
};

const handleDeletePublicRegistration = async (registrationId: string, fullName: string) => {
  if (!confirm(`Are you sure you want to delete registration for "${fullName}"?`)) {
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("public_event_registrations")
      .delete()
      .eq("id", registrationId);

    if (error) throw error;

    toast({
      title: "Registration Deleted",
      description: `Registration for "${fullName}" has been deleted`,
    });

    await refreshData();
  } catch (error: any) {
    toast({
      title: "Delete Failed",
      description: error.message,
      variant: "destructive",
    });
  }
};
```

### 3.6 Add export functionality (in exportToExcel function, around line 1100)

```typescript
case "public-registrations":
  data = publicRegistrations.map((reg) => ({
    "Registration Number": reg.registration_number,
    "Full Name": reg.full_name,
    "Email": reg.email,
    "Phone Number": reg.phone_number,
    "Institution": reg.institution,
    "Title": reg.title,
    "Gender": reg.gender,
    "Province": reg.province,
    "District": reg.district,
    "Group": reg.registration_group === "group1" ? "Group 1 (25-27 Mar)" : "Group 2 (30 Mar-2 Apr)",
    "Payment Modes": reg.payment_modes?.join(", ") || "N/A",
    "Status": reg.status,
    "Registered At": formatTime(reg.created_at),
  }));
  filename = `public_registrations_export_${new Date().toISOString().split("T")[0]}.csv`;
  headers = [
    "Registration Number",
    "Full Name",
    "Email",
    "Phone Number",
    "Institution",
    "Title",
    "Gender",
    "Province",
    "District",
    "Group",
    "Payment Modes",
    "Status",
    "Registered At",
  ];
  break;
```

## Step 4: Update Stats Grid (Optional - around line 1750)

Add a new stat card for public registrations:

```typescript
<Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  <CardContent className="p-6 relative">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">
          Public Registrations
        </p>
        <p className="text-3xl font-bold text-gray-900">
          {publicRegistrations.length}
        </p>
        <div className="flex items-center mt-2">
          <FileText className="w-4 h-4 text-purple-500 mr-1" />
          <span className="text-sm text-purple-600 font-medium">
            From Website
          </span>
        </div>
      </div>
      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <FileText className="w-7 h-7 text-white" />
      </div>
    </div>
  </CardContent>
</Card>
```

## Key Features

1. **Separate Tab**: Public registrations have their own dedicated tab
2. **Clean UI**: Easy to read table with all important information
3. **Group Badges**: Visual distinction between Group 1 and Group 2
4. **Payment Mode Icons**: Visual indicators for payment methods
5. **Status Management**: Admins can mark registrations as confirmed
6. **Export**: CSV export functionality
7. **Search**: Works with the global search bar
8. **Responsive**: Mobile-friendly design

## Benefits

- No mixing with authenticated user registrations
- Clear visual separation
- Easy to filter and manage
- Export for offline processing
- Status tracking for follow-up
