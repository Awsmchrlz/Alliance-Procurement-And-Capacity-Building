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
    dinnerGalaPrice?: number;
    currency: string;
    totalAmount: number;
  };
}

const PRICING_CONFIG = {
  private_sector: {
    basePrices: {
      withoutPackages: 7000,
      withBoatCruiseAndVictoriaFalls: 8200,
    },
    packages: {
      dinnerGala: 2500,
    },
    currency: 'ZMW',
  },
  public_sector: {
    basePrices: {
      withoutPackages: 6500,
      withBoatCruiseAndVictoriaFalls: 7700,
    },
    packages: {
      dinnerGala: 2500,
    },
    currency: 'ZMW',
  },
  international: {
    basePrices: {
      withoutPackages: 650,
      withAccommodation: 800,
      withAccommodationAndBoatCruiseAndVictoriaFalls: 950,
    },
    packages: {
      dinnerGala: 110,
    },
    currency: 'USD',
  },
} as const;

export const generateInvoice = async (data: InvoiceData): Promise<void> => {
  try {
    if (!data || !data.registrationNumber || !data.participant?.firstName || !data.event?.title) {
      throw new Error('Missing required invoice data');
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = 20;

    // Header with company branding
    doc.setFillColor(28, 53, 107);
    doc.rect(0, 0, pageWidth, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ALLIANCE PROCUREMENT & CAPACITY BUILDING LTD', pageWidth / 2, 12, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('SUPPLY CHAIN MATTERS', pageWidth / 2, 19, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('REGISTRATION INVOICE', pageWidth / 2, 26, { align: 'center' });

    y = 38;

    // Invoice metadata
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, pageWidth - 2 * margin, 16, 'F');

    doc.setTextColor(64, 64, 64);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Registration #: ${data.registrationNumber}`, margin + 4, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice Date: ${format(new Date(), 'dd MMM yyyy')}`, margin + 4, y + 12);

    // Payment status
    const isPaid = data.registration.paymentStatus === 'paid';
    doc.setTextColor(isPaid ? 34 : 239, isPaid ? 197 : 68, isPaid ? 94 : 68);
    doc.setFont('helvetica', 'bold');
    doc.text(data.registration.paymentStatus.toUpperCase(), pageWidth - margin - 4, y + 10, { align: 'right' });

    y += 22;

    // Event Details
    doc.setFillColor(28, 53, 107);
    doc.rect(margin, y, pageWidth - 2 * margin, 9, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('EVENT DETAILS', margin + 4, y + 6);

    y += 11;

    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, pageWidth - 2 * margin, 18, 'F');

    doc.setTextColor(64, 64, 64);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Event:', margin + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    const eventTitle = data.event.title.length > 50 ? data.event.title.substring(0, 47) + '...' : data.event.title;
    doc.text(eventTitle, margin + 18, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.text('Date:', margin + 4, y + 11);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(data.event.date), 'dd MMM yyyy'), margin + 18, y + 11);

    doc.setFont('helvetica', 'bold');
    doc.text('Venue:', margin + 80, y + 11);
    doc.setFont('helvetica', 'normal');
    const venue = data.event.venue.length > 30 ? data.event.venue.substring(0, 27) + '...' : data.event.venue;
    doc.text(venue, margin + 95, y + 11);

    y += 24;

    // Participant Details
    doc.setFillColor(28, 53, 107);
    doc.rect(margin, y, pageWidth - 2 * margin, 9, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PARTICIPANT DETAILS', margin + 4, y + 6);

    y += 11;

    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, pageWidth - 2 * margin, 24, 'F');

    doc.setTextColor(64, 64, 64);
    doc.setFontSize(8);

    const fullName = `${data.participant.firstName} ${data.participant.lastName}`;
    doc.setFont('helvetica', 'bold');
    doc.text(fullName, margin + 4, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.text(data.participant.email, margin + 4, y + 11);
    doc.text(`Phone: ${data.participant.phoneNumber}`, margin + 4, y + 16);

    if (data.participant.organization) {
      const org = data.participant.organization.length > 25 ? data.participant.organization.substring(0, 22) + '...' : data.participant.organization;
      doc.text(org, margin + 90, y + 6);
    }
    if (data.participant.position) {
      const pos = data.participant.position.length > 25 ? data.participant.position.substring(0, 22) + '...' : data.participant.position;
      doc.text(pos, margin + 90, y + 11);
    }
    if (data.participant.country) {
      doc.text(data.participant.country, margin + 90, y + 16);
    }

    y += 30;

    // Registration Details
    doc.setFillColor(28, 53, 107);
    doc.rect(margin, y, pageWidth - 2 * margin, 9, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('REGISTRATION DETAILS', margin + 4, y + 6);

    y += 11;

    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, pageWidth - 2 * margin, 12, 'F');

    doc.setTextColor(64, 64, 64);
    doc.setFontSize(8);

    const delegateTypes = {
      private_sector: 'Private Sector',
      public_sector: 'Public Sector',
      international: 'International Delegate',
    };
    const delegateType = delegateTypes[data.registration.delegateType];

    doc.setFont('helvetica', 'bold');
    doc.text('Delegate Type:', margin + 4, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(delegateType, margin + 33, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.text('Registered:', margin + 90, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(format(new Date(data.registration.registeredAt), 'dd/MM/yyyy'), margin + 110, y + 7);

    y += 18;

    // Invoice Summary
    doc.setFillColor(28, 53, 107);
    doc.rect(margin, y, pageWidth - 2 * margin, 9, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE SUMMARY', margin + 4, y + 6);

    y += 13;

    doc.setTextColor(64, 64, 64);
    doc.setFontSize(8);

    // Line items
    const addLine = (label: string, amount: number) => {
      doc.setFont('helvetica', 'normal');
      doc.text(label, margin + 4, y);
      const amountText = `${data.pricing.currency} ${amount.toLocaleString()}`;
      doc.setFont('helvetica', 'bold');
      doc.text(amountText, pageWidth - margin - 4, y, { align: 'right' });
      y += 6;
    };

    addLine(`${delegateType} Registration`, data.pricing.basePrice);

    if (data.pricing.accommodationPrice) {
      addLine('Accommodation Package', data.pricing.accommodationPrice);
    }

    if (data.pricing.victoriaFallsPrice) {
      addLine('Excursions Package', data.pricing.victoriaFallsPrice);
    }

    if (data.pricing.dinnerGalaPrice) {
      addLine('Dinner Gala', data.pricing.dinnerGalaPrice);
    }

    y += 2;

    // Divider
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);

    y += 7;

    // Total
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 3, pageWidth - 2 * margin, 11, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(64, 64, 64);
    doc.text('TOTAL AMOUNT:', margin + 4, y + 4);

    const totalText = `${data.pricing.currency} ${data.pricing.totalAmount.toLocaleString()}`;
    doc.text(totalText, pageWidth - margin - 4, y + 4, { align: 'right' });

    // Footer
    const footerY = pageHeight - 18;

    doc.setFillColor(28, 53, 107);
    doc.rect(0, footerY, pageWidth, 18, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Alliance Procurement and Capacity Building', pageWidth / 2, footerY + 7, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const timestamp = format(new Date(), 'dd MMMM yyyy \'at\' HH:mm');
    doc.text(`Generated on ${timestamp}`, pageWidth / 2, footerY + 12, { align: 'center' });

    // Save PDF
    const fileName = `Invoice-${data.registrationNumber}-${format(new Date(), 'yyyyMMdd')}.pdf`;
    doc.save(fileName);

  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to generate invoice');
  }
};

export const formatRegistrationForInvoice = (registration: any): InvoiceData => {
  try {
    if (!registration) throw new Error('Registration data is required');
    if (!registration.delegateType) throw new Error('Delegate type is required');

    const delegateTypeMapping: Record<string, keyof typeof PRICING_CONFIG> = {
      'private': 'private_sector',
      'public': 'public_sector',
      'international': 'international',
      'private_sector': 'private_sector',
      'public_sector': 'public_sector',
    };

    const mappedDelegateType = delegateTypeMapping[registration.delegateType] || 'private_sector';
    const config = PRICING_CONFIG[mappedDelegateType];

    const { basePrices, packages, currency } = config;
    let totalAmount = 0;
    let basePrice = 0;
    let accommodationPrice = 0;
    let victoriaFallsPrice = 0;
    const dinnerGalaPrice = registration.dinnerGalaAttendance ? packages.dinnerGala : 0;

    if (mappedDelegateType === 'international') {
      if (registration.accommodationPackage && (registration.victoriaFallsPackage || registration.boatCruisePackage)) {
        totalAmount = basePrices.withAccommodationAndBoatCruiseAndVictoriaFalls;
        basePrice = basePrices.withoutPackages;
        accommodationPrice = basePrices.withAccommodation - basePrices.withoutPackages;
        victoriaFallsPrice = basePrices.withAccommodationAndBoatCruiseAndVictoriaFalls - basePrices.withAccommodation;
      } else if (registration.accommodationPackage) {
        totalAmount = basePrices.withAccommodation;
        basePrice = basePrices.withoutPackages;
        accommodationPrice = basePrices.withAccommodation - basePrices.withoutPackages;
      } else {
        totalAmount = basePrices.withoutPackages;
        basePrice = basePrices.withoutPackages;
      }
    } else {
      if (registration.victoriaFallsPackage || registration.boatCruisePackage) {
        totalAmount = basePrices.withBoatCruiseAndVictoriaFalls;
        basePrice = basePrices.withoutPackages;
        victoriaFallsPrice = basePrices.withBoatCruiseAndVictoriaFalls - basePrices.withoutPackages;
      } else {
        totalAmount = basePrices.withoutPackages;
        basePrice = basePrices.withoutPackages;
      }
    }

    totalAmount += dinnerGalaPrice;

    return {
      registrationNumber: registration.registrationNumber || `TEMP-${Date.now()}`,
      event: {
        title: registration.event?.title || 'Alliance Procurement and Capacity Building Event',
        date: registration.event?.startDate || registration.event?.date || new Date().toISOString(),
        venue: registration.event?.location || registration.event?.venue || 'To be announced',
      },
      participant: {
        firstName: registration.firstName || 'N/A',
        lastName: registration.lastName || 'N/A',
        email: registration.email || 'N/A',
        phoneNumber: registration.phoneNumber || 'N/A',
        organization: registration.organization,
        position: registration.position,
        country: registration.country,
      },
      registration: {
        delegateType: mappedDelegateType,
        accommodationPackage: Boolean(registration.accommodationPackage),
        victoriaFallsPackage: Boolean(registration.victoriaFallsPackage),
        boatCruisePackage: Boolean(registration.boatCruisePackage),
        dinnerGalaAttendance: Boolean(registration.dinnerGalaAttendance),
        registeredAt: registration.registeredAt || new Date().toISOString(),
        paymentStatus: registration.paymentStatus || 'pending',
        paymentMethod: registration.paymentMethod,
      },
      pricing: {
        basePrice,
        accommodationPrice: accommodationPrice > 0 ? accommodationPrice : undefined,
        victoriaFallsPrice: victoriaFallsPrice > 0 ? victoriaFallsPrice : undefined,
        dinnerGalaPrice: dinnerGalaPrice > 0 ? dinnerGalaPrice : undefined,
        currency,
        totalAmount: Math.max(totalAmount, 0),
      },
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to format registration data');
  }
};