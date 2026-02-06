const GETRESPONSE_API_KEY = process.env.GETRESPONSE_API_KEY;
const GETRESPONSE_LIST_TOKEN = process.env.GETRESPONSE_LIST_TOKEN;
const GETRESPONSE_API_URL = 'https://api.getresponse.com/v3';

interface GetResponseContact {
  email: string;
  campaign: { campaignId: string };
  customFieldValues?: { customFieldId: string; value: string[] }[];
}

export async function addContactToGetResponse(
  email: string,
  options?: { variant?: string }
): Promise<{ success: boolean; error?: string }> {
  if (!GETRESPONSE_API_KEY || !GETRESPONSE_LIST_TOKEN) {
    console.warn('GetResponse not configured — skipping');
    return { success: false, error: 'GetResponse not configured' };
  }

  const contact: GetResponseContact = {
    email,
    campaign: { campaignId: GETRESPONSE_LIST_TOKEN },
  };

  // Add variant as custom field if provided
  if (options?.variant) {
    const VARIANT_FIELD_ID = process.env.GETRESPONSE_VARIANT_FIELD_ID;
    if (VARIANT_FIELD_ID) {
      contact.customFieldValues = [
        { customFieldId: VARIANT_FIELD_ID, value: [options.variant] },
      ];
    }
  }

  const res = await fetch(`${GETRESPONSE_API_URL}/contacts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': `api-key ${GETRESPONSE_API_KEY}`,
    },
    body: JSON.stringify(contact),
  });

  if (res.status === 202 || res.status === 200) {
    return { success: true };
  }

  // 409 = contact already exists — treat as success
  if (res.status === 409) {
    return { success: true };
  }

  const body = await res.text();
  console.error('GetResponse error:', res.status, body);
  return { success: false, error: `GetResponse ${res.status}` };
}
