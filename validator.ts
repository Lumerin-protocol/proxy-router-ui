import Ajv from "ajv";
import addFormats from "ajv-formats";

export function newAjv() {
  const ajv = new Ajv({ coerceTypes: true, useDefaults: true });
  return addFormats(ajv, [
    "date-time",
    "time",
    "date",
    "email",
    "hostname",
    "ipv4",
    "ipv6",
    "uri",
    "uri-reference",
    "uuid",
    "uri-template",
    "json-pointer",
    "relative-json-pointer",
    "regex",
  ]);
}
