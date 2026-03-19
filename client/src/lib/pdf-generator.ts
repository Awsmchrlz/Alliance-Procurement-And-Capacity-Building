import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface PublicRegistration {
  id: string;
  registration_number: string;
  full_name: string;
  email: string;
  phone_number: string;
  institution: string;
  gender: string;
  title: string;
  province: string;
  district: string;
  registration_group: string;
  payment_modes: string[];
  status: string;
  created_at: string;
}

export function generatePublicRegistrationPDF(registrations: PublicRegistration[]) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  // Header
  doc.setFontSize(16);
  doc.setTextColor(28, 53, 107); // #1C356B
  doc.text('2026 NATIONAL SEMINAR - MINISTRY OF HEALTH', pageWidth / 2, margin + 8, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Public Event Registrations Report', pageWidth / 2, margin + 15, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, margin + 20, { align: 'center' });

  // Table data
  const tableData = registrations.map((reg) => [
    reg.registration_number,
    reg.full_name,
    reg.title,
    reg.institution,
    reg.gender,
    reg.email,
    reg.phone_number,
    reg.province,
    reg.district,
    reg.registration_group === 'group1' ? 'Group 1' : 'Group 2',
    reg.payment_modes?.join(', ') || '',
    reg.status === 'confirmed' ? '✓ Confirmed' : reg.status === 'cancelled' ? '✗ Cancelled' : 'Pending',
  ]);

  // Add table
  (doc as any).autoTable({
    head: [
      [
        'Reg #',
        'Full Name',
        'Title',
        'Institution',
        'Gender',
        'Email',
        'Phone',
        'Province',
        'District',
        'Group',
        'Payment Mode',
        'Status',
      ],
    ],
    body: tableData,
    startY: margin + 25,
    margin: margin,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: 'linebreak',
      halign: 'left',
    },
    headStyles: {
      fillColor: [28, 53, 107], // #1C356B
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { cellWidth: 20 },
      2: { cellWidth: 18 },
      3: { cellWidth: 20 },
      4: { halign: 'center', cellWidth: 12 },
      5: { cellWidth: 22 },
      6: { cellWidth: 18 },
      7: { cellWidth: 15 },
      8: { cellWidth: 15 },
      9: { halign: 'center', cellWidth: 12 },
      10: { cellWidth: 18 },
      11: { halign: 'center', cellWidth: 15 },
    },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || pageHeight - 20;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`Total Registrations: ${registrations.length}`, margin, finalY + 10);
  doc.text(`Page 1 of 1`, pageWidth - margin - 20, finalY + 10);

  // Save
  doc.save(`public_registrations_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateSingleRegistrationPDF(registration: PublicRegistration) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = margin;

  // Header
  doc.setFontSize(18);
  doc.setTextColor(28, 53, 107);
  doc.text('REGISTRATION CONFIRMATION', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  doc.setFontSize(12);
  doc.setTextColor(28, 91, 125);
  doc.text('2026 NATIONAL SEMINAR - MINISTRY OF HEALTH', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Divider
  doc.setDrawColor(28, 53, 107);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Registration Details
  doc.setFontSize(11);
  doc.setTextColor(28, 53, 107);
  doc.text('REGISTRATION DETAILS', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const details = [
    ['Registration Number:', registration.registration_number],
    ['Status:', registration.status === 'confirmed' ? 'Confirmed' : registration.status === 'cancelled' ? 'Cancelled' : 'Pending'],
    ['Registered Date:', new Date(registration.created_at).toLocaleDateString()],
    ['Group:', registration.registration_group === 'group1' ? 'Group 1 (25-28 March 2026)' : 'Group 2 (30 March - 2 April 2026)'],
  ];

  details.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, margin, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(String(value), margin + 50, yPosition);
    yPosition += 7;
  });

  yPosition += 5;

  // Participant Information
  doc.setFontSize(11);
  doc.setTextColor(28, 53, 107);
  doc.text('PARTICIPANT INFORMATION', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const participantInfo = [
    ['Full Name:', registration.full_name],
    ['Title/Position:', registration.title],
    ['Gender:', registration.gender],
    ['Institution:', registration.institution],
    ['Email:', registration.email],
    ['Phone Number:', registration.phone_number],
  ];

  participantInfo.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, margin, yPosition);
    doc.setFont(undefined, 'normal');
    const textWidth = pageWidth - margin - 50 - margin;
    const wrappedText = doc.splitTextToSize(String(value), textWidth);
    doc.text(wrappedText, margin + 50, yPosition);
    yPosition += wrappedText.length > 1 ? wrappedText.length * 5 + 2 : 7;
  });

  yPosition += 5;

  // Location Information
  doc.setFontSize(11);
  doc.setTextColor(28, 53, 107);
  doc.text('LOCATION INFORMATION', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const locationInfo = [
    ['Province:', registration.province],
    ['District:', registration.district],
  ];

  locationInfo.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, margin, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(String(value), margin + 50, yPosition);
    yPosition += 7;
  });

  yPosition += 5;

  // Payment Information
  doc.setFontSize(11);
  doc.setTextColor(28, 53, 107);
  doc.text('PAYMENT INFORMATION', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  doc.setFont(undefined, 'bold');
  doc.text('Payment Modes:', margin, yPosition);
  doc.setFont(undefined, 'normal');
  const paymentModes = registration.payment_modes?.map((mode) => {
    if (mode === 'cash') return 'Cash';
    if (mode === 'mobileMoney') return 'Mobile Money';
    if (mode === 'bankTransfer') return 'Bank Transfer';
    return mode;
  }).join(', ') || 'Not specified';
  doc.text(paymentModes, margin + 50, yPosition);
  yPosition += 10;

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('This is an automated confirmation. Please keep this document for your records.', margin, pageWidth - 20);

  // Save
  doc.save(`registration_${registration.registration_number}.pdf`);
}
