import { v4 as uuidv4 } from "uuid";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const generateUnique = (initialString?: string): string => {
  const uniqueId = uuidv4();
  console.log(uniqueId, "uniqueIdfucntion res=========>>");

  // Extract the first 8 characters from the UUID
  const unqId = uniqueId.substring(0, 6);

  return initialString ? initialString + unqId : unqId;
};

export const generateReceiptNumber = (id: any) => {
  let increementNumber = 500000;
  const fixedDigits = "T00";

  increementNumber = increementNumber + Number(id);
  const receiptNumber = fixedDigits + increementNumber;

  return receiptNumber;
};

export default function generateUniqueId(unique: any) {
  const length = 4;
  const possibleDigits = "0123456789"; // All possible digits

  for (let i = 0; i < length; i++) {
    // Select a random digit from possibleDigits and append it to the id
    unique += possibleDigits.charAt(
      Math.floor(Math.random() * possibleDigits.length)
    );
  }

  return unique;
}

export async function generateInchargeId(ulb_id: any) {

  function startsWithDigit(id: string) {
    return /^\d/.test(id);
  }

  function getThreeDigitNumber(num: number) {
    return num.toString().padStart(3, '0');
  }

  const lastIncharge = await prisma.parking_incharge.findFirst({
    orderBy: {
      created_at: 'desc'
    },
    where: {
      cunique_id: {
        startsWith: String(ulb_id).padStart(2, '0')
      }
    }
  })

  let lastInchargeIdDigits = '000'

  if (lastIncharge) {
    if (startsWithDigit(lastIncharge?.cunique_id)) {
      lastInchargeIdDigits = String(lastIncharge?.cunique_id).slice(2)
    }
  }

  const digitsToUse = getThreeDigitNumber(Number(lastInchargeIdDigits) + 1)

  const incharge_id = `${String(ulb_id).padStart(2, '0')}${digitsToUse}`

  return incharge_id;
}