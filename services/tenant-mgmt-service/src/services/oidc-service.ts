import {injectable, BindingScope} from '@loopback/core';
import {ManagementClient} from 'auth0';
import * as dotenv from 'dotenv';

dotenv.config();

@injectable({scope: BindingScope.TRANSIENT})
export class Auth0Service {
  private management: ManagementClient;

  constructor() {
    this.management = new ManagementClient({
      domain: process.env.AUTH0_DOMAIN || '',
      clientId: process.env.AUTH0_CLIENT_ID || '',
      clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
      audience: process.env.AUTH0_AUDIENCE,
    });
  }

  async createOrganization(data: {
    name: string;
    display_name: string;
    logo_url?: string;
    primary_color?: string;
    page_background?: string;
    link_color?: string;
  }) {
    try {
      return await this.management.organizations.create({
        name: data.name,
        display_name: data.display_name,
        branding: {
          logo_url: data.logo_url,
          colors: {
            primary: data.primary_color || '',
            page_background: data.page_background || '',
          },
        },
        enabled_connections: [],
      });
    } catch (error) {
      throw new Error(`Error creating organization: ${error.message}`);
    }
  }
  async createUser(userData: {
    email: string;
    name: string;
    connection: string;
    password: string;
    verify_email: boolean;
    username?: string;
    phone_number?: string;
  }) {
    try {
      return await this.management.users.create({
        email: userData.email,
        name: userData.name,
        connection: userData.connection,
        password: userData.password,
        verify_email: userData.verify_email,
        username: userData.username,
        phone_number: userData.phone_number,
      });
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async addMemberToOrganization(organizationId: string, userId: string) {
    try {
      return await this.management.organizations.addMembers(
        {id: organizationId},
        {
          members: [userId],
        },
      );
    } catch (error) {
      throw new Error(`Error adding member to organization: ${error.message}`);
    }
  }
}
