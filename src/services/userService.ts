
import { supabase } from '../integrations/supabase/client';

export interface UserRole {
  id: string;
  userId: string;
  role: 'admin' | 'praticien' | 'staff' | 'user';
  createdAt: string;
}

// Function to convert DB data to UserRole type
const mapDbUserRoleToUserRole = (dbUserRole: any): UserRole => ({
  id: dbUserRole.id,
  userId: dbUserRole.user_id,
  role: dbUserRole.role,
  createdAt: dbUserRole.created_at
});

export const userService = {
  // Get current user's role
  async getCurrentUserRole(): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 'praticien';

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'praticien';
      }

      return data?.role || 'praticien';
    } catch (error) {
      console.error('Error in getCurrentUserRole:', error);
      return 'praticien';
    }
  },

  // Check if current user is admin
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const role = await this.getCurrentUserRole();
      return role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // Get all user roles (admin only)
  async getAllUserRoles(): Promise<UserRole[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          *,
          auth.users!inner(email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user roles:', error);
        throw error;
      }

      return data?.map(mapDbUserRoleToUserRole) || [];
    } catch (error) {
      console.error('Error in getAllUserRoles:', error);
      throw error;
    }
  },

  // Update user role (admin only)
  async updateUserRole(userId: string, role: 'admin' | 'praticien' | 'staff' | 'user'): Promise<UserRole> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }

      return mapDbUserRoleToUserRole(data);
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      throw error;
    }
  },

  // Create user role (usually handled automatically by trigger)
  async createUserRole(userId: string, role: 'admin' | 'praticien' | 'staff' | 'user' = 'user'): Promise<UserRole> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role }])
        .select()
        .single();

      if (error) {
        console.error('Error creating user role:', error);
        throw error;
      }

      return mapDbUserRoleToUserRole(data);
    } catch (error) {
      console.error('Error in createUserRole:', error);
      throw error;
    }
  },

  // Delete user role
  async deleteUserRole(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting user role:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteUserRole:', error);
      throw error;
    }
  }
};
