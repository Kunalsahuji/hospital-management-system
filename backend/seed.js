const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const patients = [
  {
    name: "Alice Smith",
    username: "alice_patient",
    email: "alice@example.com",
    password: "password123",
    phone: "9876543210",
    role: "patient",
    dateOfBirth: new Date("1990-01-01"),
    gender: "Female",
    address: "123 Main St, Cityville"
  },
  {
    name: "Bob Jones",
    username: "bob_patient",
    email: "bob@example.com",
    password: "password123",
    phone: "9876543211",
    role: "patient",
    dateOfBirth: new Date("1985-05-15"),
    gender: "Male",
    address: "456 Elm St, Townsville"
  },
  {
    name: "Charlie Brown",
    username: "charlie_patient",
    email: "charlie@example.com",
    password: "password123",
    phone: "9876543212",
    role: "patient",
    dateOfBirth: new Date("1992-08-20"),
    gender: "Male",
    address: "789 Oak St, Villageville"
  },
  {
    name: "Diana Prince",
    username: "diana_patient",
    email: "diana@example.com",
    password: "password123",
    phone: "9876543213",
    role: "patient",
    dateOfBirth: new Date("1988-11-11"),
    gender: "Female",
    address: "321 Pine St, Hamletville"
  },
  {
    name: "Eve Davis",
    username: "eve_patient",
    email: "eve@example.com",
    password: "password123",
    phone: "9876543214",
    role: "patient",
    dateOfBirth: new Date("1995-03-30"),
    gender: "Female",
    address: "654 Maple St, Boroughville"
  }
];

const doctors = [
  {
    name: "Dr. John Doe",
    username: "dr_johndoe",
    email: "john.doe@hospital.com",
    password: "password123",
    phone: "8765432101",
    role: "doctor",
    specialization: "Cardiology",
    qualification: "MD, DM Cardiology",
    experience: 10,
    consultationFee: 500,
    hospital: "City Heart Institute",
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableFrom: "09:00",
    availableTo: "17:00",
    bio: "Top cardiologist with 10 years of experience in complex heart surgeries."
  },
  {
    name: "Dr. Jane Roe",
    username: "dr_janeroe",
    email: "jane.roe@hospital.com",
    password: "password123",
    phone: "8765432102",
    role: "doctor",
    specialization: "Pediatrics",
    qualification: "MD Pediatrics",
    experience: 8,
    consultationFee: 400,
    hospital: "Kids Care Clinic",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableFrom: "10:00",
    availableTo: "16:00",
    bio: "Caring pediatrician specializing in child nutrition and immunizations."
  },
  {
    name: "Dr. Mark Lee",
    username: "dr_marklee",
    email: "mark.lee@hospital.com",
    password: "password123",
    phone: "8765432103",
    role: "doctor",
    specialization: "Dermatology",
    qualification: "MBBS, MD Dermatology",
    experience: 5,
    consultationFee: 300,
    hospital: "Skin & Hair Clinic",
    availableDays: ["Monday", "Tuesday", "Wednesday"],
    availableFrom: "09:00",
    availableTo: "14:00",
    bio: "Expert dermatologist specializing in cosmetic and clinical dermatology."
  },
  {
    name: "Dr. Sarah Connor",
    username: "dr_sarah",
    email: "sarah@hospital.com",
    password: "password123",
    phone: "8765432104",
    role: "doctor",
    specialization: "Neurology",
    qualification: "MD, DM Neurology",
    experience: 12,
    consultationFee: 800,
    hospital: "Central Hospital",
    availableDays: ["Thursday", "Friday"],
    availableFrom: "11:00",
    availableTo: "18:00",
    bio: "Experienced neurologist with a focus on stroke and headache management."
  },
  {
    name: "Dr. David Smith",
    username: "dr_david",
    email: "david@hospital.com",
    password: "password123",
    phone: "8765432105",
    role: "doctor",
    specialization: "Orthopedics",
    qualification: "MS Orthopedics",
    experience: 15,
    consultationFee: 600,
    hospital: "Bone & Joint Center",
    availableDays: ["Monday", "Thursday"],
    availableFrom: "08:00",
    availableTo: "13:00",
    bio: "Senior orthopedic surgeon specializing in joint replacement."
  },
  {
    name: "Dr. Emily Chen",
    username: "dr_emily",
    email: "emily@hospital.com",
    password: "password123",
    phone: "8765432106",
    role: "doctor",
    specialization: "Psychiatry",
    qualification: "MD Psychiatry",
    experience: 7,
    consultationFee: 700,
    hospital: "Mind Wellness Center",
    availableDays: ["Wednesday", "Friday", "Saturday"],
    availableFrom: "12:00",
    availableTo: "19:00",
    bio: "Compassionate psychiatrist offering therapy for anxiety and depression."
  },
  {
    name: "Dr. Robert Wilson",
    username: "dr_robert",
    email: "robert@hospital.com",
    password: "password123",
    phone: "8765432107",
    role: "doctor",
    specialization: "General Medicine",
    qualification: "MBBS, MD Medicine",
    experience: 20,
    consultationFee: 300,
    hospital: "Family Health Clinic",
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    availableFrom: "09:00",
    availableTo: "20:00",
    bio: "Trusted family doctor with over two decades of experience."
  },
  {
    name: "Dr. Lisa Wong",
    username: "dr_lisa",
    email: "lisa@hospital.com",
    password: "password123",
    phone: "8765432108",
    role: "doctor",
    specialization: "Gynecology",
    qualification: "MS OBG",
    experience: 9,
    consultationFee: 500,
    hospital: "Women's Health Clinic",
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableFrom: "10:00",
    availableTo: "15:00",
    bio: "Specialist in women's health, maternity, and laparoscopic surgeries."
  },
  {
    name: "Dr. James Taylor",
    username: "dr_james",
    email: "james@hospital.com",
    password: "password123",
    phone: "8765432109",
    role: "doctor",
    specialization: "Ophthalmology",
    qualification: "MS Ophthalmology",
    experience: 11,
    consultationFee: 400,
    hospital: "Clear Vision Eye Center",
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableFrom: "09:00",
    availableTo: "16:00",
    bio: "Expert eye surgeon for cataract and LASIK surgeries."
  },
  {
    name: "Dr. William Brown",
    username: "dr_william",
    email: "william@hospital.com",
    password: "password123",
    phone: "8765432110",
    role: "doctor",
    specialization: "ENT",
    qualification: "MS ENT",
    experience: 6,
    consultationFee: 350,
    hospital: "ENT Specialist Clinic",
    availableDays: ["Tuesday", "Thursday"],
    availableFrom: "10:00",
    availableTo: "14:00",
    bio: "Specializes in treating ear, nose, and throat disorders."
  }
];

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');

    console.log('Deleting existing dummy users if any...');
    // Only delete the specific seed users to avoid wiping user's real data
    const usernames = [...patients.map(p => p.username), ...doctors.map(d => d.username)];
    await User.deleteMany({ username: { $in: usernames } });

    console.log('Seeding new patients...');
    for (const p of patients) {
      await User.create(p);
    }
    
    console.log('Seeding new doctors...');
    for (const d of doctors) {
      await User.create(d);
    }

    console.log('Data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
