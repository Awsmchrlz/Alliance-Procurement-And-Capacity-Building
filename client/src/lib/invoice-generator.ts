import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface InvoiceData {
  registrationNumber: string;
  event: {
    title: string;
    date: string;
    venue: string;
  };
  participant: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    organization?: string;
    position?: string;
    country?: string;
  };
  registration: {
    delegateType: 'private_sector' | 'public_sector' | 'international';
    accommodationPackage?: boolean;
    victoriaFallsPackage?: boolean;
    boatCruisePackage?: boolean;
    dinnerGalaAttendance?: boolean;
    registeredAt: string;
    paymentStatus: string;
    paymentMethod?: string;
  };
  pricing: {
    basePrice: number;
    accommodationPrice?: number;
    victoriaFallsPrice?: number;
    boatCruisePrice?: number;
    dinnerGalaPrice?: number;
    currency: string;
    totalAmount: number;
  };
}

export const generateInvoice = async (data: InvoiceData): Promise<void> => {
  const doc = new jsPDF();

  // Colors
  const primaryColor = [28, 53, 107]; // #1C356B
  const secondaryColor = [135, 206, 235]; // #87CEEB
  const accentColor = [59, 130, 246]; // Blue accent
  const darkGray = [64, 64, 64];
  const lightGray = [128, 128, 128];
  const successColor = [34, 197, 94]; // Green
  const warningColor = [239, 68, 68]; // Red

  // Page dimensions
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const centerX = pageWidth / 2;

  // Professional header with clean text design
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Add subtle gradient effect
  doc.setFillColor(135, 206, 235, 0.15);
  doc.rect(0, 35, pageWidth, 10, 'F');

  // Company name - centered and professional
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const titleText = 'ALLIANCE PROCUREMENT & CAPACITY BUILDING LTD';
  const titleWidth = doc.getTextWidth(titleText);
  doc.text(titleText, centerX - titleWidth / 2, 18);

  // Tagline - centered
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const taglineText = 'SUPPLY CHAIN MATTERS';
  const taglineWidth = doc.getTextWidth(taglineText);
  doc.text(taglineText, centerX - taglineWidth / 2, 28);

  // Subtitle - centered
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');

  // Registration number box - prominent and centered
  let yPos = 60;

  // Registration number highlight box
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 25, 5, 5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const regText = `Registration Number: ${data.registrationNumber}`;
  const regTextWidth = doc.getTextWidth(regText);
  doc.text(regText, centerX - regTextWidth / 2, yPos + 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateText = `Generated: ${format(new Date(), 'MMMM dd, yyyy')}`;
  const dateTextWidth = doc.getTextWidth(dateText);
  doc.text(dateText, centerX - dateTextWidth / 2, yPos + 20);

  yPos += 35;

  // Event details section - better formatted
  doc.setFillColor(248, 250, 252); // Light gray background
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 45, 3, 3, 'F');

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('EVENT DETAILS', margin + 8, yPos + 8);

  yPos += 20;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(10);

  // Event name
  doc.setFont('helvetica', 'bold');
  doc.text('Event:', margin + 8, yPos);
  doc.setFont('helvetica', 'normal');
  const eventTitle = data.event.title.length > 50 ? data.event.title.substring(0, 50) + '...' : data.event.title;
  doc.text(eventTitle, margin + 30, yPos);

  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', margin + 8, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(data.event.date), 'EEEE, MMMM dd, yyyy'), margin + 30, yPos);

  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Venue:', margin + 8, yPos);
  doc.setFont('helvetica', 'normal');
  const venue = data.event.venue.length > 45 ? data.event.venue.substring(0, 45) + '...' : data.event.venue;
  doc.text(venue, margin + 30, yPos);

  yPos += 15;

  // Participant details section - two column layout
  yPos += 10;
  const participantHeight = 55;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, participantHeight, 3, 3, 'F');

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PARTICIPANT DETAILS', margin + 8, yPos + 8);

  yPos += 20;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(10);

  // Left column
  const leftCol = margin + 8;
  const rightCol = centerX + 5;

  doc.setFont('helvetica', 'bold');
  doc.text('Name:', leftCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.participant.firstName} ${data.participant.lastName}`, leftCol + 25, yPos);

  doc.setFont('helvetica', 'bold');
  doc.text('Email:', rightCol, yPos);
  doc.setFont('helvetica', 'normal');
  const email = data.participant.email.length > 25 ? data.participant.email.substring(0, 25) + '...' : data.participant.email;
  doc.text(email, rightCol + 25, yPos);

  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Phone:', leftCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.participant.phoneNumber, leftCol + 25, yPos);

  if (data.participant.country) {
    doc.setFont('helvetica', 'bold');
    doc.text('Country:', rightCol, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.participant.country, rightCol + 25, yPos);
  }

  if (data.participant.organization) {
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Organization:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    const org = data.participant.organization.length > 35 ? data.participant.organization.substring(0, 35) + '...' : data.participant.organization;
    doc.text(org, leftCol + 35, yPos);
  }

  if (data.participant.position) {
    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Position:', leftCol, yPos);
    doc.setFont('helvetica', 'normal');
    const pos = data.participant.position.length > 35 ? data.participant.position.substring(0, 35) + '...' : data.participant.position;
    doc.text(pos, leftCol + 30, yPos);
  }

  yPos += 15;

  // Registration details section - compact
  yPos += 10;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 3, 3, 'F');

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('REGISTRATION DETAILS', margin + 8, yPos + 8);

  yPos += 20;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(10);

  const delegateTypeText = data.registration.delegateType === 'private_sector' ? 'Private Sector' :
    data.registration.delegateType === 'public_sector' ? 'Public Sector' :
      data.registration.delegateType === 'international' ? 'International Delegate' :
        'Private Sector'; // Default fallback

  doc.setFont('helvetica', 'bold');
  doc.text('Delegate Type:', leftCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(delegateTypeText, leftCol + 35, yPos);

  doc.setFont('helvetica', 'bold');
  doc.text('Registration Date:', rightCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(data.registration.registeredAt), 'dd/MM/yyyy'), rightCol + 45, yPos);

  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Status:', leftCol, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(data.registration.paymentStatus === 'paid' ? successColor[0] : warningColor[0], data.registration.paymentStatus === 'paid' ? successColor[1] : warningColor[1], data.registration.paymentStatus === 'paid' ? successColor[2] : warningColor[2]);
  doc.text(data.registration.paymentStatus.toUpperCase(), leftCol + 40, yPos);
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

  yPos += 15;

  // Pricing breakdown section - professional table
  yPos += 10;
  const pricingHeight = 80;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, pricingHeight, 3, 3, 'F');

  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PRICING BREAKDOWN', margin + 8, yPos + 8);

  // Table header
  yPos += 20;
  doc.setFillColor(229, 231, 235);
  doc.roundedRect(margin + 5, yPos - 5, pageWidth - 2 * margin - 10, 10, 2, 2, 'F');

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', margin + 8, yPos);
  doc.text('Amount', pageWidth - margin - 35, yPos);

  // Base registration
  yPos += 12;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(`${delegateTypeText} Registration`, margin + 8, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.pricing.currency} ${data.pricing.basePrice.toLocaleString()}`, pageWidth - margin - 35, yPos);

  // Additional packages
  if (data.registration.accommodationPackage && data.pricing.accommodationPrice) {
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text('Accommodation Package', margin + 8, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.pricing.currency} ${data.pricing.accommodationPrice.toLocaleString()}`, pageWidth - margin - 35, yPos);
  }

  // Handle Victoria Falls and Boat Cruise packages based on delegate type
  if (data.registration.delegateType === 'international') {
    // International delegates have combined package
    if ((data.registration.victoriaFallsPackage || data.registration.boatCruisePackage) && data.pricing.victoriaFallsPrice) {
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.text('Victoria Falls Adventure + Boat Cruise Package', margin + 8, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`${data.pricing.currency} ${data.pricing.victoriaFallsPrice.toLocaleString()}`, pageWidth - margin - 35, yPos);
    }
  } else {
    // Local delegates have combined package
    if ((data.registration.victoriaFallsPackage || data.registration.boatCruisePackage) && data.pricing.victoriaFallsPrice) {
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.text('Victoria Falls Adventure + Boat Cruise Package', margin + 8, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`${data.pricing.currency} ${data.pricing.victoriaFallsPrice.toLocaleString()}`, pageWidth - margin - 35, yPos);
    }
  }

  if (data.registration.dinnerGalaAttendance && data.pricing.dinnerGalaPrice) {
    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.text('Dinner Gala', margin + 8, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.pricing.currency} ${data.pricing.dinnerGalaPrice.toLocaleString()}`, pageWidth - margin - 35, yPos);
  }

  // Total line with highlight
  yPos += 15;
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.roundedRect(margin + 5, yPos - 8, pageWidth - 2 * margin - 10, 15, 2, 2, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL AMOUNT:', margin + 8, yPos);
  doc.text(`${data.pricing.currency} ${data.pricing.totalAmount.toLocaleString()}`, pageWidth - margin - 45, yPos);

  yPos += 20;

  // Payment instructions (if pending)
  if (data.registration.paymentStatus === 'pending') {
    yPos += 10;
    doc.setFillColor(254, 243, 199); // Warm yellow background
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 25, 3, 3, 'F');

    doc.setFillColor(217, 119, 6); // Orange header
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT INSTRUCTIONS', margin + 8, yPos + 7);

    yPos += 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 53, 15);
    doc.text('Please complete your payment and upload evidence in your dashboard.', margin + 8, yPos);
    doc.text('Your registration will be confirmed once payment is verified.', margin + 8, yPos + 6);
    yPos += 20;
  }

  // Footer - professional and centered
  const footerY = pageHeight - 25;
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, footerY, pageWidth, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const footerTitle = 'Alliance Procurement and Capacity Building';
  const footerTitleWidth = doc.getTextWidth(footerTitle);
  doc.text(footerTitle, centerX - footerTitleWidth / 2, footerY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const footerDate = `Generated on ${format(new Date(), 'MMMM dd, yyyy at HH:mm')}`;
  const footerDateWidth = doc.getTextWidth(footerDate);
  doc.text(footerDate, centerX - footerDateWidth / 2, footerY + 18);

  // Download the PDF
  const fileName = `Registration-Receipt-${data.registrationNumber}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
};

// Pricing configuration for all delegate types
const PRICING_CONFIG = {
  private_sector: {
    basePrice: 7000,
    currency: 'ZMW',
    packages: {
      victoriaFallsAndBoatCruise: 2500, // Combined package for local delegates
      dinnerGala: 2500,
    },
  },
  public_sector: {
    basePrice: 6500,
    currency: 'ZMW',
    packages: {
      victoriaFallsAndBoatCruise: 2500, // Combined package for local delegates
      dinnerGala: 2500,
    },
  },
  international: {
    basePrice: 650,
    currency: 'USD',
    packages: {
      accommodation: 150,
      victoriaFallsAndBoatCruise: 150, // Combined package for international delegates
      dinnerGala: 110,
    },
  },
};

// Helper function to format pricing data
export const formatRegistrationForInvoice = (registration: any): InvoiceData => {
  // Map delegate types to match pricing config
  const delegateTypeMapping: { [key: string]: keyof typeof PRICING_CONFIG } = {
    'private': 'private_sector',
    'public': 'public_sector',
    'international': 'international',
    'private_sector': 'private_sector',
    'public_sector': 'public_sector'
  };

  const mappedDelegateType = delegateTypeMapping[registration.delegateType] || registration.delegateType;
  const config = PRICING_CONFIG[mappedDelegateType as keyof typeof PRICING_CONFIG];

  if (!config) {
    throw new Error(`Invalid delegate type: ${registration.delegateType} (mapped to: ${mappedDelegateType})`);
  }

  const { basePrice, currency, packages } = config;
  let totalAmount = basePrice;

  // Calculate package prices
  const accommodationPrice = registration.accommodationPackage && packages.accommodation ? packages.accommodation : 0;
  const dinnerGalaPrice = registration.dinnerGalaAttendance ? packages.dinnerGala : 0;

  let victoriaFallsPrice = 0;
  let boatCruisePrice = 0;

  // Handle different pricing logic for international vs local delegates
  if (mappedDelegateType === 'international') {
    // International delegates have combined Victoria Falls and Boat Cruise package
    if (registration.victoriaFallsPackage || registration.boatCruisePackage) {
      victoriaFallsPrice = packages.victoriaFallsAndBoatCruise;
      boatCruisePrice = 0; // Don't double count
    }
  } else {
    // Local delegates have combined Victoria Falls + Boat Cruise package
    if (registration.victoriaFallsPackage || registration.boatCruisePackage) {
      victoriaFallsPrice = packages.victoriaFallsAndBoatCruise;
      boatCruisePrice = 0; // Don't double count
    }
  }

  // Add all selected packages to total
  totalAmount += accommodationPrice + victoriaFallsPrice + boatCruisePrice + dinnerGalaPrice;

  return {
    registrationNumber: registration.registrationNumber || 'N/A',
    event: {
      title: registration.event?.title || 'Alliance Procurement and Capacity Building Event',
      date: registration.event?.startDate || new Date().toISOString(),
      venue: registration.event?.location || registration.event?.venue || 'To be announced',
    },
    participant: {
      firstName: registration.firstName || 'N/A',
      lastName: registration.lastName || 'N/A',
      email: registration.email || 'N/A',
      phoneNumber: registration.phoneNumber || 'N/A',
      organization: registration.organization || 'N/A',
      position: registration.position || 'N/A',
      country: registration.country || 'N/A',
    },
    registration: {
      delegateType: mappedDelegateType,
      accommodationPackage: registration.accommodationPackage,
      victoriaFallsPackage: registration.victoriaFallsPackage,
      boatCruisePackage: registration.boatCruisePackage,
      dinnerGalaAttendance: registration.dinnerGalaAttendance,
      registeredAt: registration.registeredAt,
      paymentStatus: registration.paymentStatus,
      paymentMethod: registration.paymentMethod,
    },
    pricing: {
      basePrice,
      accommodationPrice: accommodationPrice > 0 ? accommodationPrice : undefined,
      victoriaFallsPrice: victoriaFallsPrice > 0 ? victoriaFallsPrice : undefined,
      boatCruisePrice: boatCruisePrice > 0 ? boatCruisePrice : undefined,
      dinnerGalaPrice: dinnerGalaPrice > 0 ? dinnerGalaPrice : undefined,
      currency,
      totalAmount,
    },
  };
};
