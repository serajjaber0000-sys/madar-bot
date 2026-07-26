const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
const https = require('https');

const configPath = path.join(process.env.USERPROFILE, '.config', 'configstore', 'firebase-tools.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
const refreshToken = config.tokens.refresh_token;

async function getAccessToken() {
  return new Promise((resolve, reject) => {
    const body = `client_id=563837298-d6fid0k5n11t49j25trgt13tqsm79r6n.apps.googleusercontent.com&client_secret=j9iVZfS8Rr1v4g5g6bJ2mN1p&refresh_token=${refreshToken}&grant_type=refresh_token`;
    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data).access_token);
        } else {
          reject(new Error(`OAuth failed: ${res.statusCode} ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function apiRequest(url, token, method = 'GET') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? JSON.parse(data) : {});
        } else {
          reject(new Error(`${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('Getting access token...');
  const token = await getAccessToken();
  console.log('Got token!');

  let allVersions = [];
  let pageToken = '';
  
  do {
    let url = 'https://firebasehosting.googleapis.com/v1beta1/projects/asaas-5eb13/sites/asaas-5eb13/versions?pageSize=100';
    if (pageToken) url += `&pageToken=${pageToken}`;
    const resp = await apiRequest(url, token);
    if (resp.versions) allVersions.push(...resp.versions);
    pageToken = resp.nextPageToken || '';
  } while (pageToken);

  console.log(`Total versions: ${allVersions.length}`);
  
  if (allVersions.length > 0) {
    console.log('Sample:', JSON.stringify(allVersions[0], null, 2));
  }

  const finalized = allVersions
    .filter(v => v.status === 'FINALIZED')
    .sort((a, b) => (a.createTime || '').localeCompare(b.createTime || ''));

  console.log(`Finalized to delete: ${finalized.length - 1} (keeping latest)`);

  let deleted = 0;
  for (let i = 0; i < finalized.length - 1; i++) {
    const name = finalized[i].name;
    if (!name) continue;
    try {
      await apiRequest(`https://firebasehosting.googleapis.com/v1beta1/${name}`, token, 'DELETE');
      deleted++;
      if (deleted % 10 === 0) console.log(`Deleted ${deleted}...`);
    } catch (e) {
      console.log(`Failed: ${name} - ${e.message}`);
    }
  }
  console.log(`Done! Deleted ${deleted} old releases.`);
}

main().catch(e => { console.error(e); process.exit(1); });
