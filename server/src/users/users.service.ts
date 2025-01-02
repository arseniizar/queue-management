import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {v4 as uuid} from 'uuid';
import {User, UserDocument} from 'src/schemas/user.schema';
import {CreateUserDto} from "@/dto";

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {
    }

    /**
     * Creates a new user after checking for duplicates by email, phone, and username.
     */
    async create(createUserDto: CreateUserDto): Promise<UserDocument> {
        const [isEmailExists, isPhoneExists, isUsernameExists] = await Promise.all([
            this.userModel.exists({email: createUserDto.email}).exec(),
            this.userModel.exists({phone: createUserDto.phone}).exec(),
            this.userModel.exists({username: createUserDto.username}).exec(),
        ]);

        if (isEmailExists) {
            throw new BadRequestException('User with this email already exists.');
        }
        if (isPhoneExists) {
            throw new BadRequestException('User with this phone number already exists.');
        }
        if (isUsernameExists) {
            throw new BadRequestException('User with this username already exists.');
        }

        const createdUser = new this.userModel({
            ...createUserDto,
            cancelled: false,
            approved: false,
            processed: false,
            key: uuid(),
            appointment: null,
        });

        return createdUser.save();
    }

    /**
     * Returns all users (as array of User documents).
     */
    async findAll(): Promise<UserDocument[]> {
        return this.userModel.find().exec();
    }

    /**
     * Finds a single user by a filter (e.g. { username: string }) and updates it.
     * Returns the original doc by default. If you want the updated doc, pass { new: true } in options.
     */
    async findOneAndUpdate(
        filter: Partial<User> | Record<string, any>,
        update: Partial<User> | Record<string, any>,
        options: Record<string, any> = {new: true}
    ): Promise<UserDocument | null> {
        return this.userModel.findOneAndUpdate(filter, update, options).exec();
    }

    /**
     * Finds a single user by username. May return null if not found.
     */
    async findOne(username: string): Promise<UserDocument | null> {
        return this.userModel.findOne({username}).exec();
    }

    /**
     * Finds a user by Mongoose _id. May return null if not found.
     */
    async findById(id: string): Promise<UserDocument | null> {
        return this.userModel.findById(id).exec();
    }

    /**
     * Finds a user by email. May return null if not found.
     */
    async findByEmail(email: string): Promise<UserDocument | null> {
        return this.userModel.findOne({email}).exec();
    }

    /**
     * Deletes a user by username. Returns the result of the deletion operation.
     */
    async delete(username: string) {
        const result = await this.userModel.deleteOne({username}).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException(`User with username "${username}" not found.`);
        }
        return result;
    }
}
