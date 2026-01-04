import validator from "validator";
import { BadRequestError } from "../utils/errors.js";

export const addAddressValidations = ({
  addressLine1,
  city,
  state,
  pincode,
  location,
}) => {
  if (
    !addressLine1 ||
    !validator.isLength(addressLine1.trim(), { min: 5, max: 200 })
  ) {
    throw new BadRequestError(
      "Address line 1 must be between 5 and 200 characters"
    );
  }

  if (!city || !validator.isLength(city.trim(), { min: 2, max: 50 })) {
    throw new BadRequestError("City must be between 2 and 50 characters");
  }

  if (!state || !validator.isLength(state.trim(), { min: 2, max: 50 })) {
    throw new BadRequestError("State must be between 2 and 50 characters");
  }

  if (!pincode || !validator.matches(pincode, /^[0-9]{6}$/)) {
    throw new BadRequestError("Pincode must be a valid 6-digit number");
  }

  if (
    location &&
    (!Array.isArray(location.coordinates) ||
      location.coordinates.length !== 2 ||
      !location.coordinates.every((c) => validator.isFloat(c.toString())))
  ) {
    throw new BadRequestError(
      "Location coordinates must be [longitude, latitude]"
    );
  }

  return true;
};
