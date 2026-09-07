// Email Notification Service using FormSubmit.co + ntfy Email gateway
// Hardcoded to deliver notification email directly to Prashant's Gmail: hustlebhaiya@gmail.com

const TARGET_GMAIL = 'hustlebhaiya@gmail.com';

export function getSavedEmail(): string {
  return localStorage.getItem('prashant_gmail') || TARGET_GMAIL;
}

export function saveEmail(email: string) {
  localStorage.setItem('prashant_gmail', email);
}

export async function sendYesNotification(herName: string, yourName: string, targetEmail?: string) {
  const email = targetEmail || getSavedEmail() || TARGET_GMAIL;

  console.log(`Sending YES email notification to ${email}...`);

  const subject = `💍 SHE SAID YES!!! ${herName} accepted your proposal! ❤️🎆`;
  const messageBody = `
🎉 CONGRATULATIONS ${yourName.toUpperCase()}! 🎉

${herName} just tapped "YES 💖" to your proposal under the moonlight on the beach!

Date & Time: ${new Date().toLocaleString()}
Status: SHE SAID YES! 💍✨

Your romantic 3D proposal experience was a success! ❤️
  `.trim();

  const results = [];

  // Method 1: FormSubmit.co direct email delivery to Gmail
  try {
    const res1 = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        Recipient: yourName,
        Status: `${herName} SAID YES! 💍💖`,
        Message: messageBody,
      }),
    });
    results.push(res1.ok);
    console.log('FormSubmit status:', res1.status);
  } catch (e) {
    console.warn('FormSubmit email failed:', e);
  }

  // Method 2: ntfy.sh with Email Header Gateway
  try {
    const res2 = await fetch('https://ntfy.sh/prashant-raj-nandani-yes-2024', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Email': email,
      },
      body: JSON.stringify({
        topic: 'prashant-raj-nandani-yes-2024',
        title: '💍 SHE SAID YES!!!',
        message: `${herName} accepted your proposal! 💖🎆`,
        priority: 5,
        tags: ['heart', 'tada', 'ring'],
      }),
    });
    results.push(res2.ok);
    console.log('ntfy Email Gateway status:', res2.status);
  } catch (e) {
    console.warn('ntfy gateway failed:', e);
  }

  return results.some(Boolean);
}

export async function sendTestNotification(targetEmail?: string) {
  const email = targetEmail || TARGET_GMAIL;
  return await sendYesNotification('Raj Nandani (TEST)', 'Prashant', email);
}
