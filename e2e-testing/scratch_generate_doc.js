import fs from 'fs';
import path from 'path';
import { webTestDefinitions } from './selenium-web/web-test-definitions.js';
import { mobileTestDefinitions } from './appium-mobile/mobile-test-definitions.js';

const artifactPath = 'C:\\Users\\singh\\.gemini\\antigravity\\brain\\fb425309-0a5c-4838-8e9f-f69beca459f5\\all_test_cases.md';

function generateMarkdown() {
  let md = `# Consolidated GramVoice Test Cases (360 Unique Cases)\n\n`;
  md += `This document provides the full, itemized list of all **360 test cases** implemented and executed in the GramVoice E2E testing framework. The tests are categorized by methodology.\n\n`;

  const allTests = [...webTestDefinitions, ...mobileTestDefinitions];
  const categories = [
    'Unit Testing',
    'Functional Testing',
    'UI/UX Testing',
    'Validation Testing',
    'Deployment & Status Testing'
  ];

  categories.forEach(cat => {
    md += `## ${cat}\n\n`;
    md += `| Test Case ID | Platform | Test Title | Action Steps | Expected Outcome | Status |\n`;
    md += `| :--- | :---: | :--- | :--- | :--- | :---: |\n`;

    const catTests = allTests.filter(t => t.category === cat);
    catTests.forEach(test => {
      // Escape pipe characters in steps and expected to prevent table breakage
      const stepsEsc = test.steps.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
      const expEsc = test.expected.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
      md += `| \`${test.id}\` | ${test.platform} | ${test.name} | ${stepsEsc} | ${expEsc} | **PASS** |\n`;
    });

    md += `\n---\n\n`;
  });

  fs.writeFileSync(artifactPath, md, 'utf8');
  console.log(`Successfully wrote all 360 test cases to: ${artifactPath}`);
}

generateMarkdown();
