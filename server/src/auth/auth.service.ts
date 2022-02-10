import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/user/schema/user.schema';
import * as bcrypt from 'bcryptjs';
import * as sgMail from '@sendgrid/mail';
import { config } from 'src/utils';
import { REQUEST } from '@nestjs/core';
import { ReqWithUser } from 'src/typings';
sgMail.setApiKey(config.SENDGRID_API_KEY);

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(REQUEST) private readonly req: ReqWithUser,
    private jwtService: JwtService,
  ) {}

  async register(data: UserDocument): Promise<UserDocument> {
    const { password, email, name } = data;
    let user = await this.userModel.findOne({ email });
    if (user)
      throw new BadRequestException('Email aleady exist, sigin instead');
    const payload: Partial<UserDocument> = {
      ...data,
      password: bcrypt.hashSync(password, 10),
      emailToken: (Math.floor(Math.random() * 90000) + 10000).toString(),
      firstName: name?.split(' ')?.[0],
      lastName: name?.split(' ')?.[1],
    };
    try {
      const mailOptions: sgMail.MailDataRequired = {
        from: config.MAIL_SENDER,
        to: {
          email: payload?.email,
          name: payload?.name,
        },
        subject: 'Please verify your email',
        html: ` <strong style="display:block">Hi ${payload.name}!</strong>
  
        <p>Please complete your registration by verifying your email address with this token</p>
  
        <h5>${payload?.emailToken}</h5>`,
      };
      await sgMail.send(mailOptions).catch((err) => {
        throw new HttpException(err, 500);
      });
      user = await this.userModel.create(payload);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ id: string; token: string; isActive: boolean }> {
    try {
      let user = await this.userModel.findOne({ email: data.email });
      if (!user) throw new NotFoundException('You are not yet registered');
      const isMatch = bcrypt.compareSync(data.password, user.password);
      if (!isMatch)
        throw new UnauthorizedException('Email or password not correct');
      const { id, isActive } = user;
      const token = `Bearer ${this.jwtService.sign(id)}`;
      user = await this.userModel.findById(id).select('-password');
      this.req.user = user;
      return { id, isActive, token };
    } catch (error) {
      throw error;
    }
  }
  async loginWithGoogle(
    data: UserDocument,
  ): Promise<{ user: Partial<UserDocument>; token: string }> {
    let user = await this.userModel
      .findOne({ email: data.email })
      .select('-password');
    if (user) {
      try {
        await this.userModel.findByIdAndUpdate(
          user.id,
          { ...data, image: user.image ? user.image : data.image },
          { new: true },
        );
        const token = this.jwtService.sign(user.id);
        return { user, token };
      } catch (error) {
        throw error;
      }
    }
    try {
      user = await this.userModel.create(data);
      const token = this.jwtService.sign(user.id);
      return { user, token };
    } catch (error) {
      throw error;
    }
  }
  async getMe(): Promise<UserDocument> {
    const user = this.req.user;
    try {
      await this.userModel.updateOne(
        { _id: user.id },
        {
          $set: { lastSeen: new Date() },
        },
      );
      // const user = await this.userModel.findById(id).select('-password');
      return user;
    } catch (error) {
      throw error;
    }
  }
  async forgotPassword(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email }).select('-password');
    if (!user) throw new NotFoundException('No record found');
    const emailToken = (Math.floor(Math.random() * 90000) + 10000).toString();
    try {
      const mailOptions: sgMail.MailDataRequired = {
        from: config.MAIL_SENDER,
        to: user?.email,
        subject: 'Your new verification code',
        html: ` <strong style="display:block">Hi ${user.firstName}!</strong>
        <h1>Hello ${user?.name}!</h1>
        <p> You requested to change your change your password ?</p>

        <p style="margin-top:20px;"> <a href=${
          config.CLIENT_URL +
          '/auth/changepassword?user_id=' +
          user?.id +
          '&token=' +
          emailToken +
          '&mode=email'
        }>Click here</a> to begin the process if you actually made the request </p>
        
       `,
      };
      await sgMail.send(mailOptions).catch((err) => {
        throw new HttpException(err, 500);
      });
      await this.userModel.findByIdAndUpdate(user.id, { $set: { emailToken } });
      return user;
    } catch (error) {
      throw error;
    }
  }
  async verifyToChangePassword(data: {
    id: string;
    emailToken: string;
  }): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(data.id);
      if (!user) throw new NotFoundException();
      if (user?.emailToken !== data?.emailToken)
        throw new UnauthorizedException();
      return user;
    } catch (error) {
      throw error;
    }
  }
  async verifyToken(emailToken: string): Promise<UserDocument> {
    if (!emailToken) throw new NotFoundException();
    try {
      const user = await this.userModel
        .findOne({ emailToken })
        .select('-password');
      if (!user) throw new NotFoundException('Invalid token');
      await this.userModel.updateOne(
        { _id: user?.id },
        { $set: { emailToken: '', isActive: true } },
        { multi: true, new: true },
      );
      return user;
    } catch (error) {
      throw error;
    }
  }
  async resendVerification(id: string): Promise<UserDocument> {
    try {
      let user = await this.userModel.findById(id).select('-password');
      if (!user) throw new NotFoundException('No record found');
      const payload: Partial<UserDocument> = {
        emailToken: (Math.floor(Math.random() * 90000) + 10000).toString(),
        name: `${user.firstName} ${user.lastName}`,
      };
      const mailOptions: sgMail.MailDataRequired = {
        from: config.MAIL_SENDER,
        to: user?.email,
        subject: 'Your new verification code',
        html: ` <strong style="display:block">Hi ${user.firstName}!</strong>
  
        <p>Here is your new verification code <b>${
          payload?.emailToken
        }</b>. You can also click <a href=${`${config.CLIENT_URL}/auth/verify?user_id=${user?.id}&token=${payload?.emailToken}`}>here to activate</a> </p>

  
       `,
      };
      await sgMail.send(mailOptions).catch((err) => {
        throw new HttpException(err, 500);
      });
      user = await this.userModel.findByIdAndUpdate(id, {
        $set: { emailToken: payload?.emailToken },
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async changePassword(data: {
    id: string;
    password: string;
  }): Promise<UserDocument> {
    try {
      const user = await this.userModel.findByIdAndUpdate(
        data.id,
        {
          $set: { password: bcrypt.hashSync(data.password) },
        },
        { new: true },
      );
      return user;
    } catch (error) {
      throw error;
    }
  }

  async changeAuthPassword(data: {
    id: string;
    oldPassword: string;
    newPassword: string;
  }): Promise<UserDocument> {
    let user = await this.userModel.findById(data.id);
    if (!user) throw new NotFoundException('No record found');
    const isMatch = bcrypt.compareSync(data.oldPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    try {
      user = await this.userModel.findByIdAndUpdate(
        data.id,
        {
          $set: {
            password: bcrypt.hashSync(data.newPassword, 10),
            emailToken: '',
          },
        },
        { multi: true },
      );
      return user;
    } catch (error) {
      throw error;
    }
  }
}
