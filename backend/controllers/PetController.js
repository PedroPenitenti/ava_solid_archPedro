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
        const id = req.params.id
        const { name, age, weight, color, available } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(422).json({ message: 'ID de Pet inválido' })
            return
        }

        const token = getToken(req)
        const user = await getUserByToken(token)

        if (!user) {
            res.status(401).json({ message: 'Usuário não autenticado' })
            return
        }

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

            const updatedData = {}

            if (name) updatedData.name = name
            if (age) updatedData.age = age
            if (weight) updatedData.weight = weight
            if (color) updatedData.color = color
            if (available !== undefined) updatedData.available = available

            const files = req.files
            if (files && files.length > 0) {
                updatedData.image = files.map((file) => file.filename)
            }

            const updatedPet = await Pet.findByIdAndUpdate(id, updatedData, { new: true })

            res.status(200).json({ message: 'Pet atualizado com sucesso!', pet: updatedPet })
        } catch (error) {
            res.status(503).json({ message: error.message })
        }
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

    static async schedule(req, res) {
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

            if (pet.user._id.toString() === user._id.toString()) {
                res.status(422).json({ message: 'O dono do pet não pode agendar visita para o próprio animal' })
                return
            }

            pet.adopter = {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                image: user.image
            }

            await pet.save()

            res.status(200).json({ message: 'Visita agendada com sucesso!' })
        } catch (error) {
            res.status(503).json({ message: error.message })
        }
    }

    static async concludeAdoption(req, res) {
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

            pet.available = false
            await pet.save()

            res.status(200).json({ message: 'Adoção concluída com sucesso!' })
        } catch (error) {
            res.status(503).json({ message: error.message })
        }
    }
}
