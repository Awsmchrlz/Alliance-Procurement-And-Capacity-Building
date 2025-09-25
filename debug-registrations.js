// Configuration
const SERVER_URL = process.env.SERVER_URL || "http://localhost:5005";
const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "testpassword123";

class RegistrationDiagnostic {
  constructor() {
    this.session = null;
    this.testUserId = null;
  }

  log(message, data = null) {
    console.log(`\n${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  async makeRequest(method, endpoint, data = null, headers = {}) {
    const url = `${SERVER_URL}${endpoint}`;
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const responseData = await response.json();

      return {
        ok: response.ok,
        status: response.status,
        data: responseData,
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: error.message,
      };
    }
  }

  async testAuthentication() {
    this.log("🔐 Step 1: Testing Authentication...");

    // Try to login or register a test user
    const loginResult = await this.makeRequest("POST", "/api/auth/login", {
      identifier: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    if (!loginResult.ok) {
      this.log("❌ Login failed, trying to register test user...");
      const registerResult = await this.makeRequest(
        "POST",
        "/api/auth/register",
        {
          firstName: "Test",
          lastName: "User",
          email: TEST_EMAIL,
          phoneNumber: "+1234567890",
          password: TEST_PASSWORD,
          gender: "other",
        },
      );

      if (!registerResult.ok) {
        this.log("❌ Failed to create test user:", registerResult);
        return false;
      }

      this.log("✅ Test user registered successfully");

      // Login again
      const retryLogin = await this.makeRequest("POST", "/api/auth/login", {
        identifier: TEST_EMAIL,
        password: TEST_PASSWORD,
      });

      if (!retryLogin.ok) {
        this.log("❌ Failed to login after registration:", retryLogin);
        return false;
      }

      this.session = retryLogin.data;
    } else {
      this.session = loginResult.data;
    }

    this.testUserId = this.session?.user?.id;
    this.log("✅ Authentication successful:", {
      userId: this.testUserId,
      email: this.session?.user?.email,
      hasToken: !!this.session?.access_token,
    });

    return true;
  }

  async testEventsAPI() {
    this.log("📅 Step 2: Testing Events API...");

    const eventsResult = await this.makeRequest("GET", "/api/events");

    if (!eventsResult.ok) {
      this.log("❌ Failed to fetch events:", eventsResult);
      return null;
    }

    this.log("✅ Events fetched successfully:", {
      count: eventsResult.data?.length || 0,
      events:
        eventsResult.data?.map((e) => ({
          id: e.id,
          title: e.title,
        })) || [],
    });

    return eventsResult.data?.[0] || null;
  }

  async testRegistrationCreation(event) {
    if (!event) {
      this.log("❌ No event available for registration test");
      return false;
    }

    this.log("📝 Step 3: Testing Registration Creation...");

    const registrationData = {
      userId: this.testUserId,
      eventId: event.id,
      country: "Test Country",
      organization: "Test Organization",
      position: "Test Position",
      delegateType: "private",
      paymentMethod: "bank",
      currency: "ZMW",
      pricePaid: 7000,
      dinnerGalaAttendance: false,
    };

    const registrationResult = await this.makeRequest(
      "POST",
      "/api/events/register",
      registrationData,
      {
        Authorization: `Bearer ${this.session.access_token}`,
      },
    );

    if (!registrationResult.ok) {
      this.log("❌ Registration creation failed:", registrationResult);
      return false;
    }

    this.log("✅ Registration created successfully:", {
      id: registrationResult.data?.id,
      registrationNumber: registrationResult.data?.registrationNumber,
      eventId: registrationResult.data?.eventId,
      userId: registrationResult.data?.userId,
    });

    return registrationResult.data;
  }

  async testRegistrationFetch() {
    this.log("📋 Step 4: Testing Registration Fetch...");

    const fetchResult = await this.makeRequest(
      "GET",
      "/api/users/registrations",
      null,
      {
        Authorization: `Bearer ${this.session.access_token}`,
      },
    );

    if (!fetchResult.ok) {
      this.log("❌ Failed to fetch registrations:", fetchResult);
      return false;
    }

    this.log("✅ Registrations fetched successfully:", {
      count: fetchResult.data?.length || 0,
      registrations:
        fetchResult.data?.map((r) => ({
          id: r.id,
          registrationNumber: r.registrationNumber,
          userId: r.userId,
          paymentStatus: r.paymentStatus,
        })) || [],
    });

    return fetchResult.data?.length > 0;
  }

  async testDatabaseDirectly() {
    this.log("🗄️ Step 5: Testing Database Query...");

    // This would require database access, but we can test via API
    const debugResult = await this.makeRequest(
      "GET",
      `/api/debug/user/${this.testUserId}/registrations`,
      null,
      {
        Authorization: `Bearer ${this.session.access_token}`,
      },
    );

    if (debugResult.ok) {
      this.log("✅ Debug endpoint responded:", debugResult.data);
    } else {
      this.log("ℹ️ Debug endpoint not available (this is normal)");
    }
  }

  async runDiagnostics() {
    this.log("🚀 Starting Registration Diagnostic...");

    try {
      // Step 1: Authentication
      const authSuccess = await this.testAuthentication();
      if (!authSuccess) {
        return;
      }

      // Step 2: Events API
      const testEvent = await this.testEventsAPI();

      // Step 3: Create Registration
      const registration = await this.testRegistrationCreation(testEvent);

      // Step 4: Fetch Registration
      const fetchSuccess = await this.testRegistrationFetch();

      // Step 5: Database Direct Query
      await this.testDatabaseDirectly();

      // Summary
      this.log("📊 DIAGNOSTIC SUMMARY:", {
        authentication: "✅ Passed",
        eventsAPI: testEvent ? "✅ Passed" : "❌ Failed",
        registrationCreation: registration ? "✅ Passed" : "❌ Failed",
        registrationFetch: fetchSuccess ? "✅ Passed" : "❌ Failed",
      });

      if (registration && fetchSuccess) {
        this.log(
          "🎉 All tests passed! Registration system appears to be working.",
        );
      } else {
        this.log("⚠️ Some tests failed. Check the logs above for details.");
      }
    } catch (error) {
      this.log("💥 Diagnostic failed with error:", error.message);
    }
  }
}

// Run diagnostics if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const diagnostic = new RegistrationDiagnostic();
  diagnostic.runDiagnostics();
}

export default RegistrationDiagnostic;
