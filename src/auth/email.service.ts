import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private twilioClient: Twilio;

  constructor() {
    this.twilioClient = new Twilio('ACb75e5dd7011e2263abacf1201a5f7e9e', 'da13b20c0cae5f0eaf50a336bbf81206');
}

  async sendOTPSMS(phoneNumber: string, otp: string): Promise<void> {
    try {
        const response =  await this.twilioClient.messages.create({
        body: `Votre code OTP est : ${otp}`,
        to: phoneNumber,
        from: '+13149382644',
      });
      console.log('SMS Sent successfully:', response.sid);
    } catch (error) {
      console.error('Error sending OTP SMS:', error);
      throw new Error('Failed to send OTP SMS.');
    }
  }
}
