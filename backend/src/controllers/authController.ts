import { Request, Response } from "express";
import { auth, db } from "../services/firebase"; // Importando Firestore também
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Cadastro de usuário (com senha criptografada)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phoneNumber, cpf, email, password } = req.body;

    const usersRef = db.collection("users");

    // Verifica se o e-mail já está cadastrado
    const snapshot = await usersRef.where("email", "==", email).get();
    if (!snapshot.empty) {
      res.status(400).json({ error: "E-mail já cadastrado" });
      return;
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Salva no Firestore
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
      console.log("⚠️ Senha ausente no Firestore!");
      res.status(500).json({ error: "Senha não cadastrada corretamente" });
      return;
    }

    const senhaCorreta = await bcrypt.compare(password, userData.password);
    console.log("🔐 Resultado da comparação:", senhaCorreta);

    if (!senhaCorreta) {
      console.log("❌ Senha incorreta");
      res.status(401).json({ error: "Senha incorreta" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      console.log("🚨 JWT_SECRET não está definido!");
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
  try {
    const { id } = req.params; // ID do usuário
    const { name, email, cpf, phoneNumber } = req.body;

    // Atualiza o documento do usuário no Firestore
    await db.collection("users").doc(id).update({
      name,
      email,
      cpf,
      phoneNumber,
      updatedAt: new Date(),
    });

    const updatedUserSnap = await db.collection("users").doc(id).get();
    const updatedUser = updatedUserSnap.data();

    res.status(200).json({
      message: "Perfil atualizado com sucesso.",
      user: {
        uid: id,
        ...updatedUser,
        password: undefined, // Não retorna a senha
      },
    });
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ error: error.message || "Erro interno ao atualizar perfil." });
  }
};