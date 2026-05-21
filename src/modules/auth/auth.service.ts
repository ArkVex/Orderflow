import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { ApiError } from "../../shared/utils/ApiError";
import { RegisterInput, LoginInput } from "./auth.schema";

export class AuthService {
  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw ApiError.conflict("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const token = this.generateToken(user.id, user.role);
    return { user, token };
  }

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const token = this.generateToken(user.id, user.role);

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
    };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    });
    if (!user) throw ApiError.notFound("User not found");
    return user;
  }

  private generateToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn as string,
    } as jwt.SignOptions);
  }
}
