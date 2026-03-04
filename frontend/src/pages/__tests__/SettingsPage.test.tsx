import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/utils/renderWithProviders'
import SettingsPage from '@/pages/SettingsPage'
import { useUIStore } from '@/stores/uiStore'

/**
 * Helper to render SettingsPage within the test provider context.
 */
function renderSettings() {
  return renderWithProviders(<SettingsPage />, { route: '/settings' })
}

describe('SettingsPage', () => {
  beforeEach(() => {
    // Reset the UI store to default state before each test
    useUIStore.setState({ theme: 'dark' })
  })

  describe('Section rendering', () => {
    it('should render the Settings heading', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
      })
    })

    it('should render the Display section', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Display')).toBeInTheDocument()
      })
    })

    it('should render the Dice section', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Dice')).toBeInTheDocument()
      })
    })

    it('should render the Auto-Save section', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Auto-Save')).toBeInTheDocument()
      })
    })

    it('should render the Defaults section', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Defaults')).toBeInTheDocument()
      })
    })

    it('should render the Data Management section', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Data Management')).toBeInTheDocument()
      })
    })

    it('should render the About section', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('About')).toBeInTheDocument()
      })
    })
  })

  describe('Theme toggle', () => {
    it('should display theme toggle button', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
      })
    })

    it('should show "Dark" as the default theme', async () => {
      renderSettings()

      await waitFor(() => {
        const themeBtn = screen.getByTestId('theme-toggle')
        expect(within(themeBtn).getByText('Dark')).toBeInTheDocument()
      })
    })

    it('should toggle theme from dark to light when clicked', async () => {
      const user = userEvent.setup()
      renderSettings()

      await waitFor(() => {
        expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
      })

      const themeBtn = screen.getByTestId('theme-toggle')
      await user.click(themeBtn)

      expect(within(themeBtn).getByText('Light')).toBeInTheDocument()
      expect(useUIStore.getState().theme).toBe('light')
    })
  })

  describe('Reduced Motion toggle', () => {
    it('should display reduced motion toggle', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Reduced Motion')).toBeInTheDocument()
      })
    })

    it('should toggle reduced motion on click', async () => {
      const user = userEvent.setup()
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Reduced Motion')).toBeInTheDocument()
      })

      const toggle = screen.getByRole('switch', { name: /reduced motion/i })
      expect(toggle).toHaveAttribute('aria-checked', 'false')

      await user.click(toggle)
      expect(toggle).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('Dice settings', () => {
    it('should display dice animation speed selector', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Dice Animation Speed')).toBeInTheDocument()
      })
    })

    it('should allow changing dice animation speed', async () => {
      const user = userEvent.setup()
      renderSettings()

      await waitFor(() => {
        expect(screen.getByLabelText('Dice Animation Speed')).toBeInTheDocument()
      })

      const select = screen.getByLabelText('Dice Animation Speed')
      await user.selectOptions(select, 'dramatic')

      expect(select).toHaveValue('dramatic')
    })

    it('should display show dice results inline toggle', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Show Dice Roll Results Inline')).toBeInTheDocument()
      })
    })
  })

  describe('Auto-Save settings', () => {
    it('should display auto-save enabled toggle', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Auto-Save Enabled')).toBeInTheDocument()
      })
    })

    it('should display auto-save interval selector', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Auto-Save Interval')).toBeInTheDocument()
      })
    })

    it('should allow selecting different auto-save intervals', async () => {
      const user = userEvent.setup()
      renderSettings()

      await waitFor(() => {
        expect(screen.getByLabelText('Auto-Save Interval')).toBeInTheDocument()
      })

      const select = screen.getByLabelText('Auto-Save Interval')
      await user.selectOptions(select, '2000')

      expect(select).toHaveValue('2000')
    })

    it('should allow selecting manual-only auto-save', async () => {
      const user = userEvent.setup()
      renderSettings()

      await waitFor(() => {
        expect(screen.getByLabelText('Auto-Save Interval')).toBeInTheDocument()
      })

      const select = screen.getByLabelText('Auto-Save Interval')
      await user.selectOptions(select, 'manual')

      expect(select).toHaveValue('manual')
    })
  })

  describe('Default settings', () => {
    it('should display default player name input', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Default Player Name')).toBeInTheDocument()
      })
    })

    it('should display default ability score method selector', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Default Ability Score Method')).toBeInTheDocument()
      })
    })

    it('should allow changing default ability score method', async () => {
      const user = userEvent.setup()
      renderSettings()

      await waitFor(() => {
        expect(
          screen.getByLabelText('Default Ability Score Method')
        ).toBeInTheDocument()
      })

      const select = screen.getByLabelText('Default Ability Score Method')
      await user.selectOptions(select, 'pointBuy')

      expect(select).toHaveValue('pointBuy')
    })

    it('should display gallery default sort selector', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Gallery Default Sort')).toBeInTheDocument()
      })
    })

    it('should allow typing in the default player name field', async () => {
      const user = userEvent.setup()
      renderSettings()

      await waitFor(() => {
        expect(screen.getByLabelText('Default Player Name')).toBeInTheDocument()
      })

      const input = screen.getByLabelText('Default Player Name')
      await user.type(input, 'Gandalf')

      expect(input).toHaveValue('Gandalf')
    })
  })

  describe('Clear All Data confirmation flow', () => {
    it('should display "Clear All Data" button', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByTestId('clear-data-btn')).toBeInTheDocument()
      })
    })

    it('should show confirmation dialog when "Clear All Data" is clicked', async () => {
      const user = userEvent.setup()
      renderSettings()

      await waitFor(() => {
        expect(screen.getByTestId('clear-data-btn')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('clear-data-btn'))

      expect(screen.getByTestId('clear-confirmation-input')).toBeInTheDocument()
      expect(screen.getByText(/Type/)).toBeInTheDocument()
    })

    it('should disable confirm button when "DELETE" is not typed', async () => {
      const user = userEvent.setup()
      renderSettings()

      await waitFor(() => {
        expect(screen.getByTestId('clear-data-btn')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('clear-data-btn'))

      const confirmBtn = screen.getByTestId('confirm-clear-btn')
      expect(confirmBtn).toBeDisabled()
    })

    it('should enable confirm button when "DELETE" is typed correctly', async () => {
      const user = userEvent.setup()
      renderSettings()

      await waitFor(() => {
        expect(screen.getByTestId('clear-data-btn')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('clear-data-btn'))

      const input = screen.getByTestId('clear-confirmation-input')
      await user.type(input, 'DELETE')

      const confirmBtn = screen.getByTestId('confirm-clear-btn')
      expect(confirmBtn).not.toBeDisabled()
    })

    it('should not enable confirm when incorrect text is typed', async () => {
      const user = userEvent.setup()
      renderSettings()

      await waitFor(() => {
        expect(screen.getByTestId('clear-data-btn')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('clear-data-btn'))

      const input = screen.getByTestId('clear-confirmation-input')
      await user.type(input, 'WRONG')

      const confirmBtn = screen.getByTestId('confirm-clear-btn')
      expect(confirmBtn).toBeDisabled()
    })

    it('should close confirmation dialog when cancel is clicked', async () => {
      const user = userEvent.setup()
      renderSettings()

      await waitFor(() => {
        expect(screen.getByTestId('clear-data-btn')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('clear-data-btn'))
      expect(screen.getByTestId('clear-confirmation-input')).toBeInTheDocument()

      await user.click(screen.getByTestId('cancel-clear-btn'))
      expect(screen.queryByTestId('clear-confirmation-input')).not.toBeInTheDocument()
    })

    it('should close confirmation dialog after successful deletion', async () => {
      const user = userEvent.setup()
      renderSettings()

      await waitFor(() => {
        expect(screen.getByTestId('clear-data-btn')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('clear-data-btn'))

      const input = screen.getByTestId('clear-confirmation-input')
      await user.type(input, 'DELETE')

      await user.click(screen.getByTestId('confirm-clear-btn'))

      expect(screen.queryByTestId('clear-confirmation-input')).not.toBeInTheDocument()
    })
  })

  describe('Export Data', () => {
    it('should display export data button', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByTestId('export-data-btn')).toBeInTheDocument()
      })
    })
  })

  describe('About section', () => {
    it('should display the app version', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByTestId('app-version')).toBeInTheDocument()
        expect(screen.getByTestId('app-version')).toHaveTextContent('0.1.0')
      })
    })

    it('should display OGL/SRD acknowledgments', async () => {
      renderSettings()

      await waitFor(() => {
        expect(screen.getByText('Acknowledgments')).toBeInTheDocument()
      })

      expect(screen.getByText(/System Reference Document/)).toBeInTheDocument()
      expect(screen.getByText(/Open Game License/)).toBeInTheDocument()
    })

    it('should include a link to the SRD', async () => {
      renderSettings()

      await waitFor(() => {
        const srdLink = screen.getByRole('link', {
          name: /System Reference Document/,
        })
        expect(srdLink).toHaveAttribute(
          'href',
          'https://dnd.wizards.com/resources/systems-reference-document'
        )
        expect(srdLink).toHaveAttribute('target', '_blank')
      })
    })
  })

  describe('Default values from preferences', () => {
    it('should load auto-save enabled state from API preferences', async () => {
      renderSettings()

      await waitFor(() => {
        // The mock preferences have autoSaveEnabled: true
        const toggle = screen.getByRole('switch', { name: /auto-save enabled/i })
        expect(toggle).toHaveAttribute('aria-checked', 'true')
      })
    })
  })
})
