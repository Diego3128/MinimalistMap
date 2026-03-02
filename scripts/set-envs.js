const fs = require('fs');
const path = require('path');

const dotenv = require('dotenv');
const envar = require('env-var')

dotenv.config({ path: './.env' }); // load  .env contents
// console.log(process.env.maptiler_api_key);

const maptilerKey = envar.get("maptiler_api_key").required().asString()

// write files
const envDir = './src/environments';
const devPath = path.join(envDir, 'environment.development.ts');
const prodPath = path.join(envDir, 'environment.ts');

if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}
// Define the file contents

const prodEnvFileContent = `
export const environment = {
  maptiler_api_key: '${maptilerKey}',
  production: true
};
`;

const devEnvFileContent = `
export const environment = {
  maptiler_api_key: '${maptilerKey}',
  production: false
};
`;

try {
  fs.writeFileSync(devPath, devEnvFileContent);
  fs.writeFileSync(prodPath, prodEnvFileContent);
  console.log(`Environment files created at: ${envDir}`);
} catch (error) {
  console.log("Error writting environment files");
}

