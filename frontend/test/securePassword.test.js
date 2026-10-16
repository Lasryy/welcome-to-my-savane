import assert from "node:assert/strict";
import test from "node:test";
import { generateSecurePassword } from "../src/utils/securePassword.js";

function constantCryptoSource(byte = 0) {
  return {
    getRandomValues(bytes) {
      bytes.fill(byte);
      return bytes;
    },
  };
}

test("regenerating after clearing the field does not repeat the last generated password", () => {
  const cryptoSource = constantCryptoSource();
  const lastGeneratedPassword = generateSecurePassword("", cryptoSource);
  const clearedInputValue = "";
  const nextPassword = generateSecurePassword(lastGeneratedPassword, cryptoSource);

  assert.equal(clearedInputValue, "");
  assert.notEqual(nextPassword, lastGeneratedPassword);
  assert.equal(nextPassword.length, 20);
  assert.match(nextPassword, /[A-Z]/);
  assert.match(nextPassword, /[a-z]/);
  assert.match(nextPassword, /[2-9]/);
  assert.match(nextPassword, /[!@#$%&*+\-=?_]/);
});
