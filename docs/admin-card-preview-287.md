# Patch 287: admin Trainer Card preview
The Members View User Card modal used the old separate card markup. It now clones the current Trainer Card structure, strips shared IDs/edit-slot attributes and fills member-specific identity, stats, character, background, special/Gym badges and six Pokémon slots, including earned shiny choices. No logged-in profile/challenge state is swapped or mutated. Older simultaneous requests are ignored.

Apply supabase/admin-member-card-preview.sql on explicit merge before deploying the frontend. This extends the existing admin-only get_admin_member_card read; its is_app_admin guard, empty search_path and existing grants are preserved. Only selected earned/active badges and completed active Gym count are added. No member records or badge selections are changed.

Validation: database transaction applied/read-tested with admin authorization, nonadmin denied, then rolled back. Desktop/mobile fixture checks: member identity/stats, badge data, shiny/custom/empty slots, template isolation, no horizontal overflow, successive members and admin guard.

After merge: Settings → Admin Tools → Members → View User Card for yourself and another member. Compare the new layout, badges, team, name and caught counts with the member's Trainer Card; check phone too. No edits or awards required.
