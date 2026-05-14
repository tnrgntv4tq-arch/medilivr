import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await hash('test1234', 12);

  await prisma.user.upsert({
    where: { email: 'client@test.com' },
    update: { password },
    create: {
      email: 'client@test.com',
      password,
      name: 'Jean Dupont',
      phone: '06 12 34 56 78',
      role: 'CLIENT',
      address: '15 Rue de Rivoli, Paris',
      lat: 48.8566,
      lng: 2.3522,
    },
  });

  await prisma.user.upsert({
    where: { email: 'pharmacie@test.com' },
    update: { password },
    create: {
      email: 'pharmacie@test.com',
      password,
      name: 'Marie Martin',
      phone: '01 42 33 44 55',
      role: 'PHARMACY',
      address: '25 Avenue des Champs-Élysées, Paris',
      lat: 48.8698,
      lng: 2.3075,
      pharmacyName: 'Pharmacie des Champs',
      pharmacyLicense: 'PH-75-12345',
    },
  });

  await prisma.user.upsert({
    where: { email: 'pharmacie2@test.com' },
    update: { password },
    create: {
      email: 'pharmacie2@test.com',
      password,
      name: 'Pierre Leroy',
      phone: '01 45 67 89 00',
      role: 'PHARMACY',
      address: '10 Rue de la Paix, Paris',
      lat: 48.8686,
      lng: 2.3310,
      pharmacyName: 'Pharmacie de la Paix',
      pharmacyLicense: 'PH-75-67890',
    },
  });

  await prisma.user.upsert({
    where: { email: 'livreur@test.com' },
    update: { password },
    create: {
      email: 'livreur@test.com',
      password,
      name: 'Ahmed Ben Ali',
      phone: '07 98 76 54 32',
      role: 'DELIVERY',
      address: 'Paris',
      lat: 48.8530,
      lng: 2.3499,
    },
  });

  console.log('Seed completed!');
  console.log('Comptes de test :');
  console.log('  Client   : client@test.com / test1234');
  console.log('  Pharmacie: pharmacie@test.com / test1234');
  console.log('  Livreur  : livreur@test.com / test1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
