import hre from "hardhat";
import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("RoleAccessControl", () => {
  const deployRoleAccessControlFixture = async () => {
    const [owner, otherAccount, thirdAccount] = await hre.ethers.getSigners();

    const RoleAccessControl = await hre.ethers.getContractFactory(
      "MockRoleAccessControl"
    );
    const roleAccessControl = await RoleAccessControl.deploy();

    return { roleAccessControl, owner, otherAccount, thirdAccount };
  };

  it("Should assign roles", async () => {
    const { roleAccessControl, otherAccount } = await loadFixture(
      deployRoleAccessControlFixture
    );

    const TEST_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("TEST_ROLE"));

    await roleAccessControl.grantRole(TEST_ROLE, otherAccount);
    expect(await roleAccessControl.hasRole(TEST_ROLE, otherAccount)).to.be.true;
  });

  it("Should check role presence", async () => {
    const { roleAccessControl, owner, otherAccount } = await loadFixture(
      deployRoleAccessControlFixture
    );

    const TEST_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("TEST_ROLE"));

    await roleAccessControl.grantRole(TEST_ROLE, otherAccount);
    await expect(
      roleAccessControl.connect(otherAccount)["checkRole(bytes32)"](TEST_ROLE)
    ).to.not.be.reverted;
    await expect(
      roleAccessControl
        .connect(owner)
        ["checkRole(bytes32,address)"](TEST_ROLE, otherAccount)
    ).to.not.be.reverted;
  });

  it("Should change role administrator", async () => {
    const { roleAccessControl } = await loadFixture(
      deployRoleAccessControlFixture
    );

    const TEST_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("TEST_ROLE"));
    const ADMIN_ROLE = hre.ethers.keccak256(
      hre.ethers.toUtf8Bytes("ADMIN_ROLE")
    );

    await roleAccessControl.setRoleAdmin(TEST_ROLE, ADMIN_ROLE);
    expect(await roleAccessControl.getRoleAdmin(TEST_ROLE)).to.equal(
      ADMIN_ROLE
    );
  });

  it("Should revoke a role from a user", async () => {
    const { roleAccessControl, otherAccount } = await loadFixture(
      deployRoleAccessControlFixture
    );

    const TEST_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("TEST_ROLE"));

    await roleAccessControl.grantRole(TEST_ROLE, otherAccount);
    expect(await roleAccessControl.hasRole(TEST_ROLE, otherAccount)).to.be.true;

    await roleAccessControl.revokeRole(TEST_ROLE, otherAccount);
    expect(await roleAccessControl.hasRole(TEST_ROLE, otherAccount)).to.be
      .false;
  });

  it("Should allow a user to renounce their role", async () => {
    const { roleAccessControl, otherAccount } = await loadFixture(
      deployRoleAccessControlFixture
    );

    const TEST_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("TEST_ROLE"));

    await roleAccessControl.grantRole(TEST_ROLE, otherAccount);
    expect(await roleAccessControl.hasRole(TEST_ROLE, otherAccount)).to.be.true;

    await roleAccessControl
      .connect(otherAccount)
      .renounceRole(TEST_ROLE, otherAccount);
    expect(await roleAccessControl.hasRole(TEST_ROLE, otherAccount)).to.be
      .false;
  });

  it("Should deny role checking without permissions", async () => {
    const { roleAccessControl, otherAccount, thirdAccount } = await loadFixture(
      deployRoleAccessControlFixture
    );

    const TEST_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("TEST_ROLE"));

    await roleAccessControl.grantRole(TEST_ROLE, otherAccount);
    await expect(
      roleAccessControl.connect(thirdAccount)["checkRole(bytes32)"](TEST_ROLE)
    ).to.be.reverted;
  });
});
