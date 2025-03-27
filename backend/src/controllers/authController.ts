import { Request, Response } from "express";
import { auth, db } from "../services/firebase"; // Importando Firestore também

// Cadastro de usuário
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, phoneNumber, cpf, email, password } = req.body;

        // Criar usuário no Firebase Auth
        const user = await auth.createUser({
            email,
            password,
            displayName: name,
            phoneNumber // Precisa estar ativado no Firebase Authentication
        });

        // Salvar CPF e Telefone no Firestore
        await db.collection("users").doc(user.uid).set({
            name,
            email,
            phoneNumber,
            cpf,
            createdAt: new Date(),
        });

        res.status(201).json({ user });
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "Erro desconhecido";
        res.status(400).json({ error: errMessage });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Buscar usuário pelo email
        const user = await auth.getUserByEmail(email);
        
        // Criar um token de login
        const customToken = await auth.createCustomToken(user.uid);

        // Buscar informações extras do Firestore (CPF e Telefone)
        const userDoc = await db.collection("users").doc(user.uid).get();
        const userData = userDoc.exists ? userDoc.data() : null;

        res.status(200).json({
            token: customToken,
            user: {
              uid: user.uid, 
              ...userData,
              email
            }
          });
          
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "Usuário ou senha incorretos";
        res.status(400).json({ error: errMessage });
    }
};