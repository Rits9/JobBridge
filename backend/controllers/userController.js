import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import { sendToken } from "../utils/jwtToken.js";

//Registers a new user by creating a record in the database.
export const register = catchAsyncErrors(async (req, res, next) => {
  // Extracts name, email, phone, password, and role from req.body.
  const { name, email, phone, password, role } = req.body;
  //Checks if all fields are provided.
  if (!name || !email || !phone || !password || !role) {
    return next(new ErrorHandler("Please fill full form!"));
  }
  //Verifies if the email is already registered.
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return next(new ErrorHandler("Email already registered!"));
  }
  //Creates a new user if the email is not registered.
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role,
  });
  //Sends a JWT token to the client using sendToken.
  sendToken(user, 200, res, "User Registered!");

});

//Logs in a user by validating their credentials.
export const login = catchAsyncErrors(async (req, res, next) => {
  //Extracts email, password, and role from req.body.

    const { email, password, role } = req.body;
    //Checks if all fields are provided.

    if (!email || !password || !role) {
      return next(new ErrorHandler("Please provide email ,password and role."));
    }
    
    //Finds the user by email and selects the password field.

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorHandler("Invalid Email Or Password.", 400));
    }
    //Compares the provided password with the stored hash.

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid Email Or Password.", 400));
    }
    //Verifies if the user's role matches the provided role.

    if (user.role !== role) {
      return next(
        new ErrorHandler(`User with provided email and ${role} not found!`, 404)
      );
    }
    //Sends a JWT token to the client using sendToken.
    sendToken(user,200, res,"User Logged In!");
  });

  // Logs out a user by clearing their authentication token.
  export const logout = catchAsyncErrors(async (req, res, next) => {
    //Clears the token cookie by setting its expiration date to the current date.

    res
      .status(201)
      .cookie("token", "", {
        httpOnly: true,
        expires: new Date(Date.now()),
      })//Sends a response indicating successful logout.
      .json({
        success: true,
        message: "Logged Out Successfully.",
      });
  });
  
  //Retrieves the logged-in user's information.
  export const getUser = catchAsyncErrors((req, res, next) => {
    //Extracts the user object from req.user (which is likely set by authentication middleware).
    const user = req.user;
    //Sends the user object in the response.
    res.status(200).json({
      success: true,
      user,
    });
  });