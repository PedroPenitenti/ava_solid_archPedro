const Pet = require('../models/Pet')
const User = require('../models/User')
const getToken = require('../helpers/get-tokens')
const getUserByToken = require('../helpers/get-user-by-token')
const mongoose = require('mongoose')

module.exports = class PetController {
    static async create(req, res) {
       const { name, age, weight, color } = req.body

        if (!name) {
            res.status(422).json({ message: 'Nome é obrigatório' })
            return
        }

        if (!age) {
            res.status(422).json({ message: 'Idade é obrigatória' })
            return
        }

        if (!weight) {
            res.status(422).json({ message: 'Peso é obrigatório' })
            return
        }

        if (!color) {
            res.status(422).json({ message: 'Cor é obrigatória' })
            return
        }

        const token = getToken(req)
        const user = await getUserByToken(token)

        if (!user) {
            res.status(401).json({ message: 'Usuário não autenticado' })
            return
        }

        const files = req.files

        if (!files || files.length === 0) {
            res.status(422).json({ message: 'Ao menos uma imagem do pet deve ser enviada' })
            return
        }

        const images = files.map((file) => file.filename)

        const pet = new Pet({
            name,
            age,
            weight,
            color,
            image: images,
            available: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                image: user.image
            }
        })

        try {
            const newPet = await pet.save()
            res.status(201).json({ message: 'Pet cadastrado com sucesso!', pet: newPet })
        } catch (error) {
            res.status(503).json({ message: error.message })
        }   
    }

    static async getAllPets(req, res) {

    }

    static async getAllUserPets(req, res) {
       
    }

    static async getAllUserAdoptions(req, res) {

    }

    static async getPetById(req, res) {

    }

    static async updatePet(req, res) {
        
    }

    static async removePetById(req, res) {
       
    }

    static async schedule(req, res) {
        
    }

    static async concludeAdoption(req, res) {
    }
}
