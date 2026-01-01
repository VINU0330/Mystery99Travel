import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("=== SMS API START ===");
    console.log("SMS API received body:", JSON.stringify(body, null, 2));

    const { phone, message } = body;

    // Validate required fields
    if (!phone || !message) {
      console.error("Missing phone or message:", { phone, message });
      return NextResponse.json(
        {
          success: false,
          error: "Phone number and message are required",
          details: { phone, message },
        },
        { status: 400 }
      );
    }

    // Get API credentials from environment variables
    const apiToken = process.env.TEXTLK_API_TOKEN;
    const senderId = process.env.TEXTLK_SENDER_ID;

    console.log("API Token exists:", !!apiToken);
    console.log("Sender ID:", senderId);

    if (!apiToken || !senderId) {
      console.error("Text.lk credentials not configured");
      return NextResponse.json(
        { success: false, error: "SMS service not configured" },
        { status: 500 }
      );
    }

    // Format phone number (ensure it's in correct format)
    let formattedPhone = String(phone)
      .trim()
      .replace(/[^0-9]/g, "");
    console.log("Original phone:", phone);
    console.log("Formatted phone (digits only):", formattedPhone);

    // Validate phone number has digits
    if (!formattedPhone || formattedPhone.length < 9) {
      console.error("Invalid phone number format:", formattedPhone);
      return NextResponse.json(
        { success: false, error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Format for Sri Lankan numbers - ensure it starts with 94
    if (formattedPhone.startsWith("0")) {
      // Remove leading 0 and add country code
      formattedPhone = "94" + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith("94")) {
      // Add country code if not present
      formattedPhone = "94" + formattedPhone;
    }

    console.log("Final formatted phone with country code:", formattedPhone);

    // Send SMS via Text.lk API (JSON format)
    const requestBody = {
      api_token: apiToken,
      sender_id: senderId,
      recipient: formattedPhone,
      message: message,
    };

    console.log(
      "Sending to Text.lk API with JSON:",
      JSON.stringify(requestBody, null, 2)
    );

    const response = await fetch("https://app.text.lk/api/http/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log("Text.lk API response:", data);

    if (!response.ok) {
      console.error("Text.lk API error:", data);
      return NextResponse.json(
        {
          success: false,
          error: data.message || "Failed to send SMS",
        },
        { status: response.status }
      );
    }

    console.log("=== SMS API END - SUCCESS ===");
    return NextResponse.json({
      success: true,
      message: "SMS sent successfully",
      data: data,
    });
  } catch (error) {
    console.error("Error sending SMS:", error);
    console.log("=== SMS API END - ERROR ===");
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send SMS",
      },
      { status: 500 }
    );
  }
}
