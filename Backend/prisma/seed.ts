import { PrismaClient } from "@prisma/client";
import foreign_wrapper from "./seeder/foreignWrapper.seed";

const prisma = new PrismaClient();

// const payroll = new PayrollDao();

async function main() {
 
  setTimeout(async () => {
    await foreign_wrapper();
  }, 2000);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
