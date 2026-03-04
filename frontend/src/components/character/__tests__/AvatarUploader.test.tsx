// =============================================================================
// Tests for AvatarUploader (Story 23.1)
//
// Tests file input rendering, error messages for invalid files,
// opening the cropper after a valid file, and the remove avatar button.
// =============================================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AvatarUploader } from '../AvatarUploader';

// -- Mocks --------------------------------------------------------------------

// Mock the avatarUtils module
vi.mock('../avatarUtils', () => ({
  validateImageFile: vi.fn((file: File) => {
    const acceptedTypes = ['image/jpeg', 'image/png'];
    if (!acceptedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload a JPEG or PNG image.',
      };
    }
    if (file.size > 2 * 1024 * 1024) {
      return { valid: false, error: 'File is too large. Maximum size is 2MB.' };
    }
    return { valid: true };
  }),
  processImage: vi.fn(
    () => Promise.resolve('data:image/jpeg;base64,processedImageData'),
  ),
  cropImage: vi.fn(
    () => Promise.resolve('data:image/jpeg;base64,croppedImageData'),
  ),
  generateDefaultAvatar: vi.fn(() => 'data:image/svg+xml;base64,defaultAvatar'),
}));

// Mock the AvatarCropper component to simplify testing
vi.mock('../AvatarCropper', () => ({
  AvatarCropper: ({
    onConfirm,
    onCancel,
  }: {
    imageUrl: string;
    onConfirm: (url: string) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="avatar-cropper">
      <button
        data-testid="mock-confirm"
        onClick={() => onConfirm('data:image/jpeg;base64,croppedResult')}
      >
        Confirm
      </button>
      <button data-testid="mock-cancel" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}));

// -- Helper: simulate file selection via fireEvent ----------------------------
// userEvent.upload respects the accept attribute and silently drops
// files that do not match, so for invalid-type tests we use fireEvent.

function simulateFileUpload(input: HTMLElement, file: File) {
  // We need to define a files property on the input since fireEvent
  // does not set it automatically.
  const fileList = {
    0: file,
    length: 1,
    item: (index: number) => (index === 0 ? file : null),
    [Symbol.iterator]: function* () {
      yield file;
    },
  };

  Object.defineProperty(input, 'files', {
    value: fileList,
    writable: true,
    configurable: true,
  });

  fireEvent.change(input);
}

// -- Test Setup ---------------------------------------------------------------

describe('AvatarUploader', () => {
  const defaultProps = {
    currentAvatarUrl: null as string | null,
    onAvatarChange: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -- Rendering Tests --------------------------------------------------------

  it('should render the upload dialog', () => {
    render(<AvatarUploader {...defaultProps} />);
    expect(screen.getByTestId('avatar-uploader-dialog')).toBeInTheDocument();
    expect(screen.getByText('Character Avatar')).toBeInTheDocument();
  });

  it('should render a file input that accepts JPEG and PNG', () => {
    render(<AvatarUploader {...defaultProps} />);
    const fileInput = screen.getByTestId('file-input');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png');
    expect(fileInput).toHaveAttribute('type', 'file');
  });

  it('should render the upload trigger button', () => {
    render(<AvatarUploader {...defaultProps} />);
    expect(screen.getByTestId('upload-trigger')).toBeInTheDocument();
    expect(screen.getByText('Click to upload an image')).toBeInTheDocument();
    expect(screen.getByText('JPEG or PNG, max 2MB')).toBeInTheDocument();
  });

  it('should render a close button', () => {
    render(<AvatarUploader {...defaultProps} />);
    expect(screen.getByTestId('uploader-close')).toBeInTheDocument();
  });

  // -- Remove Avatar Tests ----------------------------------------------------

  it('should show Remove Avatar button when avatar is present', () => {
    render(
      <AvatarUploader
        {...defaultProps}
        currentAvatarUrl="data:image/jpeg;base64,existingAvatar"
      />,
    );
    expect(screen.getByTestId('remove-avatar')).toBeInTheDocument();
    expect(screen.getByText('Remove Avatar')).toBeInTheDocument();
  });

  it('should not show Remove Avatar button when no avatar is present', () => {
    render(<AvatarUploader {...defaultProps} currentAvatarUrl={null} />);
    expect(screen.queryByTestId('remove-avatar')).not.toBeInTheDocument();
  });

  it('should call onAvatarChange(null) and onClose when Remove Avatar is clicked', async () => {
    const user = userEvent.setup();
    const onAvatarChange = vi.fn();
    const onClose = vi.fn();

    render(
      <AvatarUploader
        currentAvatarUrl="data:image/jpeg;base64,existingAvatar"
        onAvatarChange={onAvatarChange}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByTestId('remove-avatar'));

    expect(onAvatarChange).toHaveBeenCalledWith(null);
    expect(onClose).toHaveBeenCalled();
  });

  // -- Error Handling Tests ---------------------------------------------------

  it('should display error for non-image file type', async () => {
    render(<AvatarUploader {...defaultProps} />);

    const fileInput = screen.getByTestId('file-input');
    const badFile = new File(['data'], 'document.pdf', {
      type: 'application/pdf',
    });

    simulateFileUpload(fileInput, badFile);

    await waitFor(() => {
      expect(screen.getByTestId('upload-error')).toBeInTheDocument();
      expect(screen.getByTestId('upload-error')).toHaveTextContent(
        'Invalid file type',
      );
    });
  });

  it('should display error for GIF file', async () => {
    render(<AvatarUploader {...defaultProps} />);

    const fileInput = screen.getByTestId('file-input');
    const gifFile = new File(['data'], 'animation.gif', {
      type: 'image/gif',
    });

    simulateFileUpload(fileInput, gifFile);

    await waitFor(() => {
      expect(screen.getByTestId('upload-error')).toBeInTheDocument();
      expect(screen.getByTestId('upload-error')).toHaveTextContent(
        'Invalid file type',
      );
    });
  });

  it('should display error for oversized file', async () => {
    render(<AvatarUploader {...defaultProps} />);

    const fileInput = screen.getByTestId('file-input');
    const largeData = new Uint8Array(3 * 1024 * 1024); // 3MB
    const largeFile = new File([largeData], 'huge.jpg', {
      type: 'image/jpeg',
    });

    simulateFileUpload(fileInput, largeFile);

    await waitFor(() => {
      expect(screen.getByTestId('upload-error')).toBeInTheDocument();
      expect(screen.getByTestId('upload-error')).toHaveTextContent('too large');
    });
  });

  // -- Cropper Integration Tests ----------------------------------------------

  it('should open the cropper after valid JPEG file selection', async () => {
    render(<AvatarUploader {...defaultProps} />);

    const fileInput = screen.getByTestId('file-input');
    const validFile = new File(['imagedata'], 'photo.jpg', {
      type: 'image/jpeg',
    });

    simulateFileUpload(fileInput, validFile);

    await waitFor(() => {
      expect(screen.getByTestId('avatar-cropper')).toBeInTheDocument();
    });
  });

  it('should open the cropper after valid PNG file selection', async () => {
    render(<AvatarUploader {...defaultProps} />);

    const fileInput = screen.getByTestId('file-input');
    const validFile = new File(['imagedata'], 'photo.png', {
      type: 'image/png',
    });

    simulateFileUpload(fileInput, validFile);

    await waitFor(() => {
      expect(screen.getByTestId('avatar-cropper')).toBeInTheDocument();
    });
  });

  it('should call onAvatarChange and onClose when cropper confirms', async () => {
    const user = userEvent.setup();
    const onAvatarChange = vi.fn();
    const onClose = vi.fn();

    render(
      <AvatarUploader
        currentAvatarUrl={null}
        onAvatarChange={onAvatarChange}
        onClose={onClose}
      />,
    );

    // Upload valid file first to show cropper
    const fileInput = screen.getByTestId('file-input');
    const validFile = new File(['imagedata'], 'photo.jpg', {
      type: 'image/jpeg',
    });
    simulateFileUpload(fileInput, validFile);

    await waitFor(() => {
      expect(screen.getByTestId('avatar-cropper')).toBeInTheDocument();
    });

    // Click confirm in the mock cropper
    await user.click(screen.getByTestId('mock-confirm'));

    expect(onAvatarChange).toHaveBeenCalledWith(
      'data:image/jpeg;base64,croppedResult',
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('should return to upload view when cropper cancels', async () => {
    const user = userEvent.setup();
    render(<AvatarUploader {...defaultProps} />);

    // Upload valid file first
    const fileInput = screen.getByTestId('file-input');
    const validFile = new File(['imagedata'], 'photo.jpg', {
      type: 'image/jpeg',
    });
    simulateFileUpload(fileInput, validFile);

    await waitFor(() => {
      expect(screen.getByTestId('avatar-cropper')).toBeInTheDocument();
    });

    // Click cancel in the mock cropper
    await user.click(screen.getByTestId('mock-cancel'));

    await waitFor(() => {
      expect(screen.getByTestId('upload-trigger')).toBeInTheDocument();
    });
  });

  // -- Close Button Tests -----------------------------------------------------

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <AvatarUploader
        currentAvatarUrl={null}
        onAvatarChange={vi.fn()}
        onClose={onClose}
      />,
    );

    await user.click(screen.getByTestId('uploader-close'));
    expect(onClose).toHaveBeenCalled();
  });
});
