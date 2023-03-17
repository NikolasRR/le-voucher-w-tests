import { jest } from "@jest/globals";
import voucherRepository from "../src/repositories/voucherRepository";
import voucherService from "../src/services/voucherService";

const voucherData = {
  code: '1NSJ192JD0S91JDA',
  discount: 25
};

const unusedVoucher = {
  id: 1,
  code: voucherData.code,
  discount: voucherData.discount,
  used: false
};

const usedVoucher = {
  id: 1,
  code: voucherData.code,
  discount: voucherData.discount,
  used: true
};

describe("Creation of voucher", () => {


  it("create voucher with given info", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => { return null });

    jest
      .spyOn(voucherRepository, "createVoucher")
      .mockImplementationOnce((): any => { });

    await voucherService.createVoucher(voucherData.code, voucherData.discount);
    expect(voucherRepository.createVoucher).toBeCalledWith(voucherData.code, voucherData.discount);
  });

  it("throw conflictError when provided code already used", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return unusedVoucher;
      });

    expect(voucherService.createVoucher(voucherData.code, voucherData.discount)).rejects.toEqual({ type: "conflict", message: "Voucher already exist." });
  })
});

describe("Apply voucher", () => {
  it("throw conflictError when provided with non existing voucher code",async () => {
    const acceptableAmount = 120;

    jest
    .spyOn(voucherRepository, 'getVoucherByCode')
    .mockImplementationOnce((): any => {return null});

    expect(voucherService.applyVoucher(voucherData.code, acceptableAmount)).rejects.toEqual({ type: "conflict", message: "Voucher does not exist." });
  });

  it("return correct body when supplied with used voucher and acceptable amount", async () => {
    const acceptableAmount = 120;
    
    jest
    .spyOn(voucherRepository, 'getVoucherByCode')
    .mockImplementationOnce((): any => {return usedVoucher});

    const result = await voucherService.applyVoucher(voucherData.code, acceptableAmount);

    expect(result.amount).toBe(acceptableAmount);
    expect(result.discount).toBe(usedVoucher.discount);
    expect(result.applied).toBe(false);
    expect(result.finalAmount).toBe(acceptableAmount);

  });

  it("return correct body when supplied with unused voucher and unacceptable amount", async () => {
    const unacceptableAmount = 99;
    
    jest
    .spyOn(voucherRepository, 'getVoucherByCode')
    .mockImplementationOnce((): any => {return usedVoucher});

    const result = await voucherService.applyVoucher(voucherData.code, unacceptableAmount);

    expect(result.amount).toBe(unacceptableAmount);
    expect(result.discount).toBe(usedVoucher.discount);
    expect(result.applied).toBe(false);
    expect(result.finalAmount).toBe(unacceptableAmount);

  });

  it("return correct body when supplied with unused voucher and acceptable amount", async () => {
    const acceptableAmount = 100;
    
    jest
    .spyOn(voucherRepository, 'getVoucherByCode')
    .mockImplementationOnce((): any => {return unusedVoucher});

    jest
    .spyOn(voucherRepository, 'useVoucher')
    .mockImplementationOnce((): any => {});

    const result = await voucherService.applyVoucher(voucherData.code, acceptableAmount);

    expect(voucherRepository.useVoucher).toBeCalledWith(unusedVoucher.code);
    expect(result.amount).toBe(acceptableAmount);
    expect(result.discount).toBe(unusedVoucher.discount);
    expect(result.applied).toBe(true);
    expect(result.finalAmount).toBe(acceptableAmount - (acceptableAmount * (unusedVoucher.discount / 100)));

  });
});