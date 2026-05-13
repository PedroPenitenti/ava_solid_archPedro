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
        try {
            const pets = await Pet.find().sort('-createdAt')
            res.status(200).json(pets)
        } catch (error) {
            res.status(503).json({ message: error.message })
        }
    }

    static async getAllUserPets(req, res) {
        try {
            const token = getToken(req)
            const user = await getUserByToken(token)

            const pets = await Pet.find({ 'user._id': user._id }).sort('-createdAt')
            res.status(200).json(pets)
        } catch (error) {
            res.status(503).json({ message: error.message })
        }
    }

    static async getAllUserAdoptions(req, res) {
        try {
            const token = getToken(req)
            const user = await getUserByToken(token)

            const pets = await Pet.find({ 'adopter._id': user._id }).sort('-createdAt')
            res.status(200).json(pets)
        } catch (error) {
            res.status(503).json({ message: error.message })
        }
    }

    static async getPetById(req, res) {
        const id = req.params.id

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(422).json({ message: 'ID de Pet inválido' })
            return
        }

        try {
            const pet = await Pet.findById(id)

            if (!pet) {
                res.status(404).json({ message: 'Pet não encontrado' })
                return
            }

            res.status(200).json(pet)
        } catch (error) {
            res.status(503).json({ message: error.message })
        }
    }

    static async updatePet(req, res) {
        
    }

    static async removePetById(req, res) {
        const id = req.params.id

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(422).json({ message: 'ID de Pet inválido' })
            return
        }

        const token = getToken(req)
        const user = await getUserByToken(token)

        try {
            const pet = await Pet.findById(id)

            if (!pet) {
                res.status(404).json({ message: 'Pet não encontrado' })
                return
            }

            if (pet.user._id.toString() !== user._id.toString()) {
                res.status(403).json({ message: 'Acesso negado, você não é o dono do Pet' })
                return
            }

            await Pet.findByIdAndDelete(id)
            res.status(200).json({ message: 'Pet removido com sucesso!' })
        } catch (error) {
            res.status(503).json({ message: error.message })
        }
    }

    static async agendamento(req, res) {
        
    }

    static async concluirAdoption(req, res) {
        
    }
}
