import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const useAppSelector = <T extends (state: RootState) => any>(
  selector: T
) => {
  return useSelector(selector);
};
