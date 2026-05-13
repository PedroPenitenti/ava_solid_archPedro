const router = require('express').Router()

const PetController = require('../controllers/PetController')

const verifyToken = require('../helpers/verify-token')
const { imageUpload } = require('../helpers/image-upload')

router.post('/create',
    verifyToken,
    imageUpload.single('image'),
    PetController.create)

router.get('/mypets',
    verifyToken,
    PetController.getAllUserPets)

router.get('/myadoptions',
    verifyToken,
    PetController.getAllUserAdoptions)

router.get('/', PetController.getAllPets)

router.get('/:id', PetController.getPetById)

router.patch('/edit/:id',
    verifyToken,
    imageUpload.single('image'),
    PetController.updatePet)

router.delete('/delete/:id',
    verifyToken,
    PetController.removePetById)

router.post('/:id/schedule',
    verifyToken,
    PetController.schedule)

router.patch('/:id/conclude',
    verifyToken,
    PetController.concludeAdoption)

module.exports = router
