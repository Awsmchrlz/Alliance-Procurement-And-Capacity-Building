import { EmailService } from './server/email-service.js';

// Test the email template with sample data
async function testEmailTemplate() {
  const emailService = new EmailService();
  
  const sampleEventData = {
    firstName: "John",
    lastName: "Doe", 
    email: "john.doe@example.com",
    eventTitle: "Advanced Procurement Strategies Workshop",
    eventDate: new Date("2024-03-15T09:00:00Z"),
    registrationNumber: "REG-2024-001",
    organization: "Global Corp Ltd",
    country: "United States"
  };

  try {
    console.log("Testing email template with sample data...");
    console.log("Sample Event Data:", JSON.stringify(sampleEventData, null, 2));
    
    // This will test the template generation without actually sending
    await emailService.sendEventRegistrationConfirmation(sampleEventData);
    
    console.log("✅ Email template test completed successfully!");
    console.log("All variables should be properly substituted in the email content.");
    
  } catch (error) {
    console.error("❌ Email template test failed:", error.message);
    console.error("Full error:", error);
  }
}

// Run the test
testEmailTemplate().then(() => {
  console.log("Test execution finished.");
}).catch(err => {
  console.error("Test execution error:", err);
});
