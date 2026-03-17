import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle } from "lucide-react";
import { Event } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface PublicEventRegistrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
}

type RegistrationGroup = "group1" | "group2" | null;

interface FormData {
  fullName: string;
  institution: string;
  gender: string;
  email: string;
  phoneNumber: string;
  title: string;
  province: string;
  district: string;
  paymentModes: {
    cash: boolean;
    mobileMoney: boolean;
    bankTransfer: boolean;
  };
}

export function PublicEventRegistration({
  open,
  onOpenChange,
  event,
}: PublicEventRegistrationProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGroup, setSelectedGroup] = useState<RegistrationGroup>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    institution: "",
    gender: "",
    email: "",
    phoneNumber: "",
    title: "",
    province: "",
    district: "",
    paymentModes: {
      cash: false,
      mobileMoney: false,
      bankTransfer: false,
    },
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGroupSelect = (group: RegistrationGroup) => {
    setSelectedGroup(group);
    setStep(3);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.fullName.trim()) {
      toast({ title: "Full name is required", variant: "destructive" });
      return;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      toast({ title: "Valid email is required", variant: "destructive" });
      return;
    }
    if (!formData.phoneNumber.trim()) {
      toast({ title: "Phone number is required", variant: "destructive" });
      return;
    }
    if (!formData.institution.trim()) {
      toast({ title: "Institution is required", variant: "destructive" });
      return;
    }
    if (!formData.gender) {
      toast({ title: "Gender is required", variant: "destructive" });
      return;
    }
    if (!formData.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (!formData.province.trim()) {
      toast({ title: "Province is required", variant: "destructive" });
      return;
    }
    if (!formData.district.trim()) {
      toast({ title: "District is required", variant: "destructive" });
      return;
    }

    const hasPaymentMode = formData.paymentModes.cash || 
                          formData.paymentModes.mobileMoney || 
                          formData.paymentModes.bankTransfer;
    if (!hasPaymentMode) {
      toast({ title: "Please select at least one payment mode", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        eventId: event.id,
        group: selectedGroup,
        fullName: formData.fullName,
        institution: formData.institution,
        gender: formData.gender,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        title: formData.title,
        province: formData.province,
        district: formData.district,
        paymentModes: Object.entries(formData.paymentModes)
          .filter(([_, selected]) => selected)
          .map(([mode]) => mode),
      };

      console.log("Submitting registration:", payload);
      
      const response = await fetch("/api/events/public-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      const result = await response.json();
      console.log("Registration successful:", result);
      
      setSuccess(true);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setStep(1);
    setSelectedGroup(null);
    setSuccess(false);
    setFormData({
      fullName: "",
      institution: "",
      gender: "",
      email: "",
      phoneNumber: "",
      title: "",
      province: "",
      district: "",
      paymentModes: {
        cash: false,
        mobileMoney: false,
        bankTransfer: false,
      },
    });
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Registration Successful!
            </h3>
            <p className="text-gray-600 mb-6">
              Thank you for registering. We'll send confirmation details to your email.
            </p>
            <Button onClick={handleClose} className="bg-[#4A90E2] hover:bg-[#4A90E2]/90">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#1C356B]">
                {step === 1 && "Event Registration"}
                {step === 2 && "Select Your Group"}
                {step === 3 && "Registration Details"}
              </DialogTitle>
              <p className="text-sm text-gray-600">{event.title}</p>
            </DialogHeader>

            {/* Step 1: Initial Registration Button */}
            {step === 1 && (
              <div className="py-8 text-center">
                <h3 className="text-xl font-semibold mb-2">
                  2026 NATIONAL SERMINER "MINISTRY OF HEALTH"
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  THEME: "STRENGTHENING RECORD MANAGEMENT AND INTERNAL CONTROLS TO
                  ENHANCE VALUE FOR MONEY IN THE PUBLIC SECTOR"
                </p>
                <Button
                  onClick={() => setStep(2)}
                  className="bg-[#1C5B7D] hover:bg-[#1C5B7D]/90 text-white px-8 py-6 text-lg rounded-lg"
                >
                  REGISTER HERE
                </Button>
              </div>
            )}

            {/* Step 2: Group Selection */}
            {step === 2 && (
              <div className="space-y-4 py-4">
                <Button
                  onClick={() => handleGroupSelect("group1")}
                  className="w-full bg-[#1C5B7D] hover:bg-[#1C5B7D]/90 text-white py-8 text-base rounded-lg"
                >
                  <div>
                    <div className="font-bold">GROUP 1 REGISTER HERE</div>
                    <div className="text-sm mt-1">25th -27th MARCH 2025 - Livingstone</div>
                  </div>
                </Button>
                
                <Button
                  onClick={() => handleGroupSelect("group2")}
                  className="w-full bg-[#1C5B7D] hover:bg-[#1C5B7D]/90 text-white py-8 text-base rounded-lg"
                >
                  <div>
                    <div className="font-bold">GROUP 2 REGISTER HERE</div>
                    <div className="text-sm mt-1">30th MARCH -2nd April 2025 - Livingstone</div>
                  </div>
                </Button>
              </div>
            )}

            {/* Step 3: Registration Form */}
            {step === 3 && (
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="fullName">Full Names</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    value={formData.institution}
                    onChange={(e) => updateField("institution", e.target.value)}
                    placeholder="Enter your institution"
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => updateField("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber">Phone number</Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => updateField("phoneNumber", e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Enter your title/position"
                  />
                </div>

                <div>
                  <Label htmlFor="province">Province</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => updateField("province", e.target.value)}
                    placeholder="Enter your province"
                  />
                </div>

                <div>
                  <Label htmlFor="district">District</Label>
                  <Input
                    id="district"
                    value={formData.district}
                    onChange={(e) => updateField("district", e.target.value)}
                    placeholder="Enter your district"
                  />
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <Label className="text-base font-semibold mb-3 block">
                    Payment mode (NO ATTACHMENT)
                  </Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cash"
                        checked={formData.paymentModes.cash}
                        onCheckedChange={(checked) =>
                          updateField("paymentModes", {
                            ...formData.paymentModes,
                            cash: checked === true,
                          })
                        }
                      />
                      <label htmlFor="cash" className="text-sm cursor-pointer">
                        CASH
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="mobileMoney"
                        checked={formData.paymentModes.mobileMoney}
                        onCheckedChange={(checked) =>
                          updateField("paymentModes", {
                            ...formData.paymentModes,
                            mobileMoney: checked === true,
                          })
                        }
                      />
                      <label htmlFor="mobileMoney" className="text-sm cursor-pointer">
                        MOBILE MONEY
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bankTransfer"
                        checked={formData.paymentModes.bankTransfer}
                        onCheckedChange={(checked) =>
                          updateField("paymentModes", {
                            ...formData.paymentModes,
                            bankTransfer: checked === true,
                          })
                        }
                      />
                      <label htmlFor="bankTransfer" className="text-sm cursor-pointer">
                        BANK TRANSFER
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-bold rounded-lg"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
