export interface Student {
    id: number;
    rollNo: string;
    hostelNumber: string;
    hostelName: string;
    name: string;
    email: string;
    department: string;
    semester: number;
    hostelRollNo: string;
    roomNumber: string;
    orders: OrderBill[];
    role: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Incharge {
    id: number;
    name: string;
    email: string;
    hostelNumber: string;
    hostelName: string;
    registrationId: string;
    role: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface OrderBill {
    id: number;
    itemName: string;
    itemPrice: number;
    buyerId: number;
    buyer: Student;
    createdAt: Date;
    updatedAt: Date;
  }
  