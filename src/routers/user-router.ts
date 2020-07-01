import express, { Request, Response, NextFunction } from 'express';
import { authenticationMiddleware } from '../middleware/authentication-middleware';
import { authorizationMiddleware } from '../middleware/authorization-middleware';
import { getAllUsers, getUserById, updateUser, saveOneUser } from '../daos/user-dao'
import { User } from '../models/User'
import { UserInputError } from "../errors/UserInputError";

export const userRouter = express.Router();

userRouter.use(authenticationMiddleware); // Authenticate User

// Get all Users

userRouter.get('/', authorizationMiddleware(['admin']), async (req:Request, res:Response, next:NextFunction)=>{
    try{
        let allUsers = await getAllUsers()
        res.json(allUsers)
    } catch(e){
        next(e)
    }
})

// Get User by Id

userRouter.get('/:id', authorizationMiddleware (['admin', 'finance-manager']), async (req:Request, res:Response, next:NextFunction)=>{
    let {id} = req.params
    if(isNaN(+id)){
        res.status(400).send('Id must be a number')
    } else {
        try {
            let user = await getUserById(+id)
            res.json(user)
        } catch (e) {
            next(e)
        }
    }
})

// Update User

userRouter.patch('/', authorizationMiddleware(['admin']), async (req:Request, res:Response, next:NextFunction)=>{
    let { userId,
        username,
        password,
        firstName,
        lastName,
        email,
        role } = req.body
    if(!userId) { 
        res.status(400).send('Id must be a number')
    }
    else if(isNaN(+userId)) { 
        res.status(400).send('Please enter a valid Id')
    }
    else {
        let updatedUser:User = {
            userId,
            username,
            password,
            firstName,
            lastName,
            email,
            role
        }
        updatedUser.username = username || undefined
        updatedUser.password = password || undefined
        updatedUser.firstName = firstName || undefined
        updatedUser.lastName = lastName || undefined
        updatedUser.email = email || undefined
        updatedUser.role = role || undefined
        try {
            let result = await updateUser(updatedUser)
            res.json(result)
        } catch (e) {
            next(e)
        }
    }
}) 

// Save (Create) User

userRouter.post('/', async (req:Request, res:Response, next:NextFunction) => {
    console.log(req.body);
    let { username,
        password,
        firstName,
        lastName,
        email,
        role } = req.body
    if(username && password && firstName && lastName && email && role) {
        let newUser: User = {
            userId: 0,
            username,
            password,
            firstName,
            lastName,
            email,
            role
        }
        try {
            let savedUser = await saveOneUser(newUser)
            res.json(savedUser)
        } catch (e) {
            next(e)
        }
    }
    else {
        next(new UserInputError)
    }
})