import { Request, Response } from "express";
import { db } from "../services/firebase"; 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phoneNumber, cpf, email, password } = req.body;

    const usersRef = db.collection("users");

    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(cpf)) {
      res.status(400).json({ error: "CPF inválido. Use o formato 999.999.999-99." });
      return;
    }

    const emailSnap = await usersRef.where("email", "==", email).get();
    if (!emailSnap.empty) {
      res.status(400).json({ error: "E-mail já cadastrado" });
      return;
    }

    const phoneSnap = await usersRef.where("phoneNumber", "==", phoneNumber).get();
    if (!phoneSnap.empty) {
      res.status(400).json({ error: "Telefone já cadastrado" });
      return;
    }

    const cpfSnap = await usersRef.where("cpf", "==", cpf).get();
    if (!cpfSnap.empty) {
      res.status(400).json({ error: "CPF já cadastrado" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await usersRef.add({
      name,
      phoneNumber,
      cpf,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    res.status(201).json({
      uid: newUser.id,
      email,
    });
  } catch (error) {
    const err = error instanceof Error ? error.message : "Erro ao registrar usuário";
    res.status(500).json({ error: err });
  }
};




export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log("🔐 Requisição de login recebida:", email);

    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      console.log("❌ Usuário não encontrado");
      res.status(401).json({ error: "Usuário não encontrado" });
      return;
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    console.log("🔍 Usuário encontrado:", userData);

    if (!userData.password) {
      res.status(500).json({ error: "Senha não cadastrada corretamente" });
      return;
    }

    const senhaCorreta = await bcrypt.compare(password, userData.password);

    if (!senhaCorreta) {
      console.log("❌ Senha incorreta");
      res.status(401).json({ error: "Senha incorreta" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      res.status(500).json({ error: "Erro interno no servidor" });
      return;
    }

    const token = jwt.sign({ uid: userDoc.id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.status(200).json({
      token,
      user: {
        uid: userDoc.id,
        ...userData,
        password: undefined,
      },
    });
  } catch (error: any) {
    console.error("❌ Erro inesperado:", error);
    res.status(500).json({ error: "Erro interno ao fazer login" });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, email, cpf, phoneNumber } = req.body;

  const usersRef = db.collection("users");

  try {
    await db.runTransaction(async (transaction) => {
      const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      if (!cpfRegex.test(cpf)) {
        throw new Error("CPF inválido. Use o formato 999.999.999-99.");
      }

      const emailSnap = await transaction.get(usersRef.where("email", "==", email));
      if (!emailSnap.empty && emailSnap.docs.some(doc => doc.id !== id)) {
        throw new Error("E-mail já cadastrado");
      }

      const phoneSnap = await transaction.get(usersRef.where("phoneNumber", "==", phoneNumber));
      if (!phoneSnap.empty && phoneSnap.docs.some(doc => doc.id !== id)) {
        throw new Error("Telefone já cadastrado");
      }

      const cpfSnap = await transaction.get(usersRef.where("cpf", "==", cpf));
      if (!cpfSnap.empty && cpfSnap.docs.some(doc => doc.id !== id)) {
        throw new Error("CPF já cadastrado");
      }

      transaction.update(usersRef.doc(id), {
        name,
        email,
        cpf,
        phoneNumber,
        updatedAt: new Date(),
      });
    });

    const updatedUserSnap = await usersRef.doc(id).get();
    const updatedUser = updatedUserSnap.data();

    res.status(200).json({
      message: "Perfil atualizado com sucesso.",
      user: {
        uid: id,
        ...updatedUser,
        password: undefined,
      },
    });
  } catch (error: unknown) {
    console.error("Erro ao atualizar perfil:", error);
  
    const mensagemErro =
      error instanceof Error
        ? error.message
        : "Erro interno ao atualizar perfil.";
  
    res.status(500).json({ error: mensagemErro });
  }
  
};